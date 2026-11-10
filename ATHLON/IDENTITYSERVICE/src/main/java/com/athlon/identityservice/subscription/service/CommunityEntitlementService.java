package com.athlon.identityservice.subscription.service;

import com.athlon.identityservice.community.entity.CommunityDetails;
import com.athlon.identityservice.community.entity.CommunityMember;
import com.athlon.identityservice.community.enums.CommunityMemberStatus;
import com.athlon.identityservice.community.enums.CommunityPlanType;
import com.athlon.identityservice.community.enums.CommunityRole;
import com.athlon.identityservice.community.repository.CommunityDetailsRepository;
import com.athlon.identityservice.community.repository.CommunityMemberRepository;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.exception.SubscriptionEntitlementException;
import com.athlon.identityservice.oganizationsubscription.entity.OrganizationSubscription;
import com.athlon.identityservice.organizationsubscription.repository.OrganizationSubscriptionRepository;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.subscription.dto.CommunityEntitlementSummaryDto;
import com.athlon.identityservice.subscription.dto.CommunitySubscriptionPlanDto;
import com.athlon.identityservice.subscription.dto.request.SubscribeCommunityPlanRequest;
import com.athlon.identityservice.subscription.entity.*;
import com.athlon.identityservice.subscription.repository.*;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CommunityEntitlementService {

    private static final Logger log = LoggerFactory.getLogger(CommunityEntitlementService.class);

    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionPlanVersionRepository versionRepository;
    private final SubscriptionPlanPriceRepository priceRepository;
    private final SubscriptionPlanLimitRepository limitRepository;
    private final SubscriptionPlanFeatureRepository featureRepository;
    private final OrganizationSubscriptionRepository orgSubRepository;
    private final OrganizationRepository organizationRepository;
    private final CommunityDetailsRepository communityDetailsRepository;
    private final CommunityMemberRepository communityMemberRepository;

    public CommunityEntitlementService(
            SubscriptionPlanRepository planRepository,
            SubscriptionPlanVersionRepository versionRepository,
            SubscriptionPlanPriceRepository priceRepository,
            SubscriptionPlanLimitRepository limitRepository,
            SubscriptionPlanFeatureRepository featureRepository,
            OrganizationSubscriptionRepository orgSubRepository,
            OrganizationRepository organizationRepository,
            CommunityDetailsRepository communityDetailsRepository,
            CommunityMemberRepository communityMemberRepository
    ) {
        this.planRepository = planRepository;
        this.versionRepository = versionRepository;
        this.priceRepository = priceRepository;
        this.limitRepository = limitRepository;
        this.featureRepository = featureRepository;
        this.orgSubRepository = orgSubRepository;
        this.organizationRepository = organizationRepository;
        this.communityDetailsRepository = communityDetailsRepository;
        this.communityMemberRepository = communityMemberRepository;
    }

    @PostConstruct
    @Transactional
    public void init() {
        seedDefaultCommunityPlans();
    }

    @Transactional
    public void seedDefaultCommunityPlans() {
        if (planRepository.findByPlanCode("COMMUNITY_FREE").isEmpty()) {
            log.info("Seeding Default Community Free (₹0 Forever Free, 50 Members) Plan...");

            SubscriptionPlan freePlan = new SubscriptionPlan(
                    "COMMUNITY_FREE",
                    "Community Free",
                    "Forever free for neighborhood groups & local meetups. Up to 50 members, session RSVPs, community feed & polls.",
                    "COMMUNITY",
                    0
            );
            freePlan.setIsActive(1);
            freePlan = planRepository.save(freePlan);

            SubscriptionPlanVersion freeVer = new SubscriptionPlanVersion();
            freeVer.setPlanId(freePlan.getPlanId());
            freeVer.setVersionNumber(1);
            freeVer.setIsPublished(true);
            freeVer.setMarketplaceCommissionRate(BigDecimal.ZERO);
            freeVer = versionRepository.save(freeVer);

            priceRepository.save(new SubscriptionPlanPrice(freeVer.getVersionId(), "MONTHLY", BigDecimal.ZERO, "INR"));
            priceRepository.save(new SubscriptionPlanPrice(freeVer.getVersionId(), "YEARLY", BigDecimal.ZERO, "INR"));

            Map<String, Integer> freeLimits = Map.of(
                    "MAX_MEMBERS", 50,
                    "MAX_COORDINATORS", 2,
                    "MAX_SESSIONS", 9999
            );
            for (Map.Entry<String, Integer> entry : freeLimits.entrySet()) {
                limitRepository.save(new SubscriptionPlanLimit(freeVer.getVersionId(), entry.getKey(), entry.getValue()));
            }

            Map<String, Boolean> freeFeatures = Map.of(
                    "COMMUNITY_SESSIONS", true,
                    "COMMUNITY_RSVP", true,
                    "COMMUNITY_FEED", true,
                    "COMMUNITY_POLLS", true,
                    "COMMUNITY_EXPENSE_KITTY", false,
                    "COMMUNITY_LEADERBOARD", false,
                    "COMMUNITY_MATCH_SCORING", false,
                    "COMMUNITY_AUTO_ALERTS", false
            );
            for (Map.Entry<String, Boolean> entry : freeFeatures.entrySet()) {
                featureRepository.save(new SubscriptionPlanFeature(freeVer.getVersionId(), entry.getKey(), entry.getValue()));
            }
        }

        if (planRepository.findByPlanCode("COMMUNITY_PRO").isEmpty()) {
            log.info("Seeding Default Community Pro (₹199/mo, 250 Members, Shared Kitty) Plan...");

            SubscriptionPlan proPlan = new SubscriptionPlan(
                    "COMMUNITY_PRO",
                    "Community Pro",
                    "Up to 250 members, shared expense kitty & treasury splitter, friendly match scoring, live leaderboards & 5 coordinators.",
                    "COMMUNITY",
                    1
            );
            proPlan.setIsActive(1);
            proPlan = planRepository.save(proPlan);

            SubscriptionPlanVersion proVer = new SubscriptionPlanVersion();
            proVer.setPlanId(proPlan.getPlanId());
            proVer.setVersionNumber(1);
            proVer.setIsPublished(true);
            proVer.setMarketplaceCommissionRate(BigDecimal.ZERO);
            proVer = versionRepository.save(proVer);

            priceRepository.save(new SubscriptionPlanPrice(proVer.getVersionId(), "MONTHLY", BigDecimal.valueOf(199), "INR"));
            priceRepository.save(new SubscriptionPlanPrice(proVer.getVersionId(), "YEARLY", BigDecimal.valueOf(1990), "INR"));

            Map<String, Integer> proLimits = Map.of(
                    "MAX_MEMBERS", 250,
                    "MAX_COORDINATORS", 5,
                    "MAX_SESSIONS", 9999
            );
            for (Map.Entry<String, Integer> entry : proLimits.entrySet()) {
                limitRepository.save(new SubscriptionPlanLimit(proVer.getVersionId(), entry.getKey(), entry.getValue()));
            }

            Map<String, Boolean> proFeatures = Map.of(
                    "COMMUNITY_SESSIONS", true,
                    "COMMUNITY_RSVP", true,
                    "COMMUNITY_FEED", true,
                    "COMMUNITY_POLLS", true,
                    "COMMUNITY_EXPENSE_KITTY", true,
                    "COMMUNITY_LEADERBOARD", true,
                    "COMMUNITY_MATCH_SCORING", true,
                    "COMMUNITY_AUTO_ALERTS", true
            );
            for (Map.Entry<String, Boolean> entry : proFeatures.entrySet()) {
                featureRepository.save(new SubscriptionPlanFeature(proVer.getVersionId(), entry.getKey(), entry.getValue()));
            }
        }

        log.info("Community subscription plans seeded successfully: COMMUNITY_FREE, COMMUNITY_PRO.");
    }

    @Transactional(readOnly = true)
    public List<CommunitySubscriptionPlanDto> getAllCommunityPlans() {
        List<SubscriptionPlan> plans = planRepository.findByTargetModuleOrderByDisplayOrderAsc("COMMUNITY");
        return plans.stream()
                .filter(p -> p.getIsActive() != null && p.getIsActive() == 1)
                .map(this::mapToCommunityPlanDto)
                .collect(Collectors.toList());
    }

    private CommunitySubscriptionPlanDto mapToCommunityPlanDto(SubscriptionPlan plan) {
        CommunitySubscriptionPlanDto dto = new CommunitySubscriptionPlanDto();
        dto.setPlanId(plan.getPlanId());
        dto.setPlanUuid(plan.getPlanUuid() != null ? plan.getPlanUuid().toString() : null);
        dto.setPlanCode(plan.getPlanCode());
        dto.setName(plan.getName());
        dto.setDescription(plan.getDescription());
        dto.setDisplayOrder(plan.getDisplayOrder());

        Optional<SubscriptionPlanVersion> verOpt = versionRepository
                .findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(plan.getPlanId());

        if (verOpt.isPresent()) {
            SubscriptionPlanVersion version = verOpt.get();
            dto.setVersionId(version.getVersionId());
            dto.setVersionNumber(version.getVersionNumber());

            List<SubscriptionPlanPrice> prices = priceRepository.findByVersionId(version.getVersionId());
            prices.forEach(p -> {
                if ("MONTHLY".equalsIgnoreCase(p.getBillingCycle())) {
                    dto.setMonthlyPrice(p.getAmount());
                } else if ("YEARLY".equalsIgnoreCase(p.getBillingCycle())) {
                    dto.setYearlyPrice(p.getAmount());
                }
            });

            List<SubscriptionPlanLimit> limits = limitRepository.findByVersionId(version.getVersionId());
            Map<String, Integer> limitMap = new HashMap<>();
            limits.forEach(l -> limitMap.put(l.getLimitCode(), l.getLimitValue()));
            dto.setLimits(limitMap);

            dto.setMaxMembers(limitMap.getOrDefault("MAX_MEMBERS", "COMMUNITY_PRO".equalsIgnoreCase(plan.getPlanCode()) ? 250 : 50));
            dto.setMaxCoordinators(limitMap.getOrDefault("MAX_COORDINATORS", "COMMUNITY_PRO".equalsIgnoreCase(plan.getPlanCode()) ? 5 : 2));

            List<SubscriptionPlanFeature> features = featureRepository.findByVersionId(version.getVersionId());
            Map<String, Boolean> featMap = new HashMap<>();
            features.forEach(f -> featMap.put(f.getFeatureCode(), f.getIsEnabled() != null && f.getIsEnabled()));
            dto.setFeatures(featMap);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public CommunityEntitlementSummaryDto getCommunityEntitlements(UUID communityUuid) {
        Organization org = organizationRepository.findByOrganizationUuid(communityUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + communityUuid));
        return getCommunityEntitlements(org);
    }

    @Transactional(readOnly = true)
    public CommunityEntitlementSummaryDto getCommunityEntitlements(Long orgId) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with ID: " + orgId));
        return getCommunityEntitlements(org);
    }

    private CommunityEntitlementSummaryDto getCommunityEntitlements(Organization org) {
        CommunityEntitlementSummaryDto dto = new CommunityEntitlementSummaryDto();
        dto.setOrganizationId(org.getOrganizationId());
        dto.setOrganizationUuid(org.getOrganizationUuid().toString());
        dto.setOrganizationName(org.getName());

        LocalDateTime now = LocalDateTime.now();
        Optional<OrganizationSubscription> subOpt = orgSubRepository.findByOrganizationIdAndStatus(org.getOrganizationId(), "ACTIVE");

        SubscriptionPlan activePlan = null;
        SubscriptionPlanVersion activeVersion = null;

        if (subOpt.isPresent()) {
            OrganizationSubscription sub = subOpt.get();
            dto.setSubscriptionStatus(sub.getStatus());
            dto.setBillingCycle(sub.getBillingCycle());
            dto.setStartDate(sub.getStartDate());
            dto.setEndDate(sub.getEndDate());
            dto.setIsTrialActive(false);

            if (sub.getEndDate() != null) {
                long remaining = ChronoUnit.DAYS.between(now, sub.getEndDate());
                dto.setDaysRemaining(Math.max(0, remaining));
                dto.setIsExpired(remaining < 0);
            } else {
                dto.setDaysRemaining(365L);
                dto.setIsExpired(false);
            }

            activePlan = planRepository.findById(sub.getPackageId()).orElse(null);
            if (activePlan != null) {
                activeVersion = versionRepository.findById(sub.getVersionId()).orElse(null);
            }
        } else {
            // Free Tier Default
            dto.setSubscriptionStatus("ACTIVE");
            dto.setIsTrialActive(false);
            dto.setIsExpired(false);
            dto.setBillingCycle("MONTHLY");
            dto.setStartDate(org.getCreatedAt() != null ? org.getCreatedAt() : now);
            dto.setEndDate(now.plusYears(10));
            dto.setDaysRemaining(3650L);

            activePlan = planRepository.findByPlanCode("COMMUNITY_FREE").orElse(null);
            if (activePlan != null) {
                activeVersion = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(activePlan.getPlanId()).orElse(null);
            }
        }

        if (activePlan != null) {
            dto.setActivePlanCode(activePlan.getPlanCode());
            dto.setActivePlanName(activePlan.getName());

            if (activeVersion != null) {
                List<SubscriptionPlanLimit> limits = limitRepository.findByVersionId(activeVersion.getVersionId());
                Map<String, Integer> limitMap = new HashMap<>();
                limits.forEach(l -> limitMap.put(l.getLimitCode(), l.getLimitValue()));
                dto.setMaxMembers(limitMap.getOrDefault("MAX_MEMBERS", "COMMUNITY_PRO".equalsIgnoreCase(activePlan.getPlanCode()) ? 250 : 50));
                dto.setMaxCoordinators(limitMap.getOrDefault("MAX_COORDINATORS", "COMMUNITY_PRO".equalsIgnoreCase(activePlan.getPlanCode()) ? 5 : 2));

                List<SubscriptionPlanFeature> features = featureRepository.findByVersionId(activeVersion.getVersionId());
                Map<String, Boolean> featMap = new HashMap<>();
                features.forEach(f -> featMap.put(f.getFeatureCode(), f.getIsEnabled() != null && f.getIsEnabled()));
                dto.setFeatures(featMap);
            }
        } else {
            dto.setActivePlanCode("COMMUNITY_FREE");
            dto.setActivePlanName("Community Free");
            dto.setMaxMembers(50);
            dto.setMaxCoordinators(2);
            dto.setFeatures(Map.of(
                    "COMMUNITY_SESSIONS", true,
                    "COMMUNITY_RSVP", true,
                    "COMMUNITY_FEED", true,
                    "COMMUNITY_POLLS", true
            ));
        }

        // Active Members Count
        long currentMembers = communityMemberRepository.countByCommunityUuidAndStatus(org.getOrganizationUuid(), CommunityMemberStatus.ACTIVE);
        dto.setCurrentMembers(currentMembers);
        int maxM = dto.getMaxMembers() != null ? dto.getMaxMembers() : 50;
        dto.setMembersRemaining(Math.max(0, (long) maxM - currentMembers));

        // Coordinators Count
        List<CommunityMember> activeList = communityMemberRepository.findByCommunityUuidAndStatus(org.getOrganizationUuid(), CommunityMemberStatus.ACTIVE);
        long currentCoordinators = activeList.stream()
                .filter(m -> m.getRole() != null && m.getRole() != CommunityRole.MEMBER)
                .count();
        dto.setCurrentCoordinators(currentCoordinators);

        return dto;
    }

    @Transactional
    public void validateMemberCapacity(UUID communityUuid) {
        CommunityEntitlementSummaryDto entitlements = getCommunityEntitlements(communityUuid);

        if (Boolean.TRUE.equals(entitlements.getIsExpired())) {
            throw new SubscriptionEntitlementException(
                    "Your community subscription has expired. Please renew to continue accepting member join requests."
            );
        }

        if (entitlements.getMaxMembers() != null && entitlements.getCurrentMembers() >= entitlements.getMaxMembers()) {
            throw new SubscriptionEntitlementException(
                    "Community member limit reached (" + entitlements.getMaxMembers() + " members). Please upgrade to Community Pro for up to 250 members."
            );
        }
    }

    @Transactional
    public CommunityEntitlementSummaryDto subscribeCommunityPlan(SubscribeCommunityPlanRequest request) {
        Organization org;
        if (request.getOrganizationId() != null) {
            org = organizationRepository.findById(request.getOrganizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + request.getOrganizationId()));
        } else if (request.getOrganizationUuid() != null) {
            org = organizationRepository.findByOrganizationUuid(UUID.fromString(request.getOrganizationUuid()))
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + request.getOrganizationUuid()));
        } else {
            throw new IllegalArgumentException("Organization ID or UUID must be provided.");
        }

        String targetCode = request.getPlanCode() != null ? request.getPlanCode() : "COMMUNITY_FREE";
        SubscriptionPlan plan = planRepository.findByPlanCode(targetCode)
                .orElseThrow(() -> new ResourceNotFoundException("Community Subscription Plan not found: " + targetCode));

        SubscriptionPlanVersion version = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(plan.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("No published version for plan: " + targetCode));

        // Close any existing active subscription
        orgSubRepository.findByOrganizationIdAndStatus(org.getOrganizationId(), "ACTIVE")
                .ifPresent(existing -> {
                    existing.setStatus("SUPERSEDED");
                    orgSubRepository.save(existing);
                });

        LocalDateTime now = LocalDateTime.now();
        String cycle = request.getBillingCycle() != null ? request.getBillingCycle().toUpperCase() : "MONTHLY";
        LocalDateTime endDate = "COMMUNITY_FREE".equalsIgnoreCase(targetCode)
                ? now.plusYears(100)
                : ("YEARLY".equals(cycle) ? now.plusYears(1) : now.plusMonths(1));

        OrganizationSubscription sub = new OrganizationSubscription();
        sub.setOrganizationId(org.getOrganizationId());
        sub.setPackageId(plan.getPlanId());
        sub.setVersionId(version.getVersionId());
        sub.setBillingCycle(cycle);
        sub.setStartDate(now);
        sub.setEndDate(endDate);
        sub.setStatus("ACTIVE");
        sub.setPaymentReference(request.getPaymentReference() != null ? request.getPaymentReference() : "WEB_COMMUNITY_" + System.currentTimeMillis());

        orgSubRepository.save(sub);

        // Sync CommunityDetails entity
        communityDetailsRepository.findByOrganizationUuid(org.getOrganizationUuid()).ifPresent(details -> {
            boolean isPro = "COMMUNITY_PRO".equalsIgnoreCase(targetCode);
            details.setPlanType(isPro ? CommunityPlanType.COMMUNITY_PRO : CommunityPlanType.COMMUNITY_FREE);
            details.setMaxMembers(isPro ? 250 : 50);
            communityDetailsRepository.save(details);
        });

        return getCommunityEntitlements(org);
    }
}

