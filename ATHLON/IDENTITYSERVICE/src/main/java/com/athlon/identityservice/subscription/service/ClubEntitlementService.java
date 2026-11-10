package com.athlon.identityservice.subscription.service;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.exception.SubscriptionEntitlementException;
import com.athlon.identityservice.oganizationsubscription.entity.OrganizationSubscription;
import com.athlon.identityservice.organizationsubscription.repository.OrganizationSubscriptionRepository;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.OrganizationMemberRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.subscription.dto.ClubEntitlementSummaryDto;
import com.athlon.identityservice.subscription.dto.ClubSubscriptionPlanDto;
import com.athlon.identityservice.subscription.dto.request.SubscribeClubPlanRequest;
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
public class ClubEntitlementService {

    private static final Logger log = LoggerFactory.getLogger(ClubEntitlementService.class);

    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionPlanVersionRepository versionRepository;
    private final SubscriptionPlanPriceRepository priceRepository;
    private final SubscriptionPlanLimitRepository limitRepository;
    private final SubscriptionPlanFeatureRepository featureRepository;
    private final OrganizationSubscriptionRepository orgSubRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository memberRepository;

    public ClubEntitlementService(
            SubscriptionPlanRepository planRepository,
            SubscriptionPlanVersionRepository versionRepository,
            SubscriptionPlanPriceRepository priceRepository,
            SubscriptionPlanLimitRepository limitRepository,
            SubscriptionPlanFeatureRepository featureRepository,
            OrganizationSubscriptionRepository orgSubRepository,
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository memberRepository
    ) {
        this.planRepository = planRepository;
        this.versionRepository = versionRepository;
        this.priceRepository = priceRepository;
        this.limitRepository = limitRepository;
        this.featureRepository = featureRepository;
        this.orgSubRepository = orgSubRepository;
        this.organizationRepository = organizationRepository;
        this.memberRepository = memberRepository;
    }

    @PostConstruct
    @Transactional
    public void init() {
        seedDefaultClubPlan();
    }

    @Transactional
    public void seedDefaultClubPlan() {
        if (planRepository.findByPlanCode("CLUB_ACCESS_PASS").isPresent()) {
            return;
        }

        log.info("Seeding Default Sports Club 30-Day Free Pass + ₹249 Subscription Plan...");

        SubscriptionPlan plan = new SubscriptionPlan(
                "CLUB_ACCESS_PASS",
                "Club Batch Pass",
                "Court batch club management: monitor member performance, batch sessions, fees, expenses, attendance, and leaderboards. 30 days free trial, then ₹249/month.",
                "CLUB",
                0
        );
        plan.setIsActive(1);
        plan = planRepository.save(plan);

        SubscriptionPlanVersion version = new SubscriptionPlanVersion();
        version.setPlanId(plan.getPlanId());
        version.setVersionNumber(1);
        version.setIsPublished(true);
        version.setMarketplaceCommissionRate(BigDecimal.ZERO);
        version = versionRepository.save(version);

        // Prices: ₹249 / month, ₹2,490 / year
        priceRepository.save(new SubscriptionPlanPrice(version.getVersionId(), "MONTHLY", BigDecimal.valueOf(249), "INR"));
        priceRepository.save(new SubscriptionPlanPrice(version.getVersionId(), "YEARLY", BigDecimal.valueOf(2490), "INR"));

        // Limits: 100 members, 3 managers, 30 days free trial
        Map<String, Integer> limits = Map.of(
                "MAX_MEMBERS", 100,
                "MAX_MANAGERS", 3,
                "TRIAL_DAYS", 30,
                "MAX_BATCHES", 9999
        );
        for (Map.Entry<String, Integer> entry : limits.entrySet()) {
            limitRepository.save(new SubscriptionPlanLimit(version.getVersionId(), entry.getKey(), entry.getValue()));
        }

        // Features
        Set<String> features = Set.of(
                "CLUB_BATCH_MANAGEMENT",
                "CLUB_ATTENDANCE",
                "CLUB_FEE_TRACKING",
                "CLUB_EXPENSE_KITTY",
                "CLUB_LEADERBOARD",
                "CLUB_MATCH_SCORING",
                "CLUB_INVENTORY",
                "CLUB_PRIORITY_COURT"
        );
        for (String feat : features) {
            featureRepository.save(new SubscriptionPlanFeature(version.getVersionId(), feat, true));
        }

        log.info("Sports Club subscription plan seeded successfully: CLUB_ACCESS_PASS.");
    }

    @Transactional(readOnly = true)
    public List<ClubSubscriptionPlanDto> getAllClubPlans() {
        List<SubscriptionPlan> plans = planRepository.findByTargetModuleOrderByDisplayOrderAsc("CLUB");
        return plans.stream()
                .filter(p -> p.getIsActive() != null && p.getIsActive() == 1)
                .map(this::mapToClubPlanDto)
                .collect(Collectors.toList());
    }

    private ClubSubscriptionPlanDto mapToClubPlanDto(SubscriptionPlan plan) {
        ClubSubscriptionPlanDto dto = new ClubSubscriptionPlanDto();
        dto.setPlanId(plan.getPlanId());
        dto.setPlanUuid(plan.getPlanUuid());
        dto.setPlanCode(plan.getPlanCode());
        dto.setName(plan.getName());
        dto.setDescription(plan.getDescription());
        dto.setDisplayOrder(plan.getDisplayOrder());

        Optional<SubscriptionPlanVersion> versionOpt = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(
                plan.getPlanId()
        );

        if (versionOpt.isPresent()) {
            SubscriptionPlanVersion version = versionOpt.get();
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

            dto.setMaxMembers(limitMap.getOrDefault("MAX_MEMBERS", 100));
            dto.setMaxManagers(limitMap.getOrDefault("MAX_MANAGERS", 3));
            dto.setTrialDays(limitMap.getOrDefault("TRIAL_DAYS", 30));

            List<SubscriptionPlanFeature> features = featureRepository.findByVersionId(version.getVersionId());
            Map<String, Boolean> featMap = new HashMap<>();
            features.forEach(f -> featMap.put(f.getFeatureCode(), f.getIsEnabled() != null && f.getIsEnabled()));
            dto.setFeatures(featMap);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public ClubEntitlementSummaryDto getClubEntitlements(UUID orgUuid) {
        Organization org = organizationRepository.findByOrganizationUuid(orgUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + orgUuid));
        return getClubEntitlements(org.getOrganizationId());
    }

    @Transactional(readOnly = true)
    public ClubEntitlementSummaryDto getClubEntitlements(Long orgId) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with ID: " + orgId));

        ClubEntitlementSummaryDto dto = new ClubEntitlementSummaryDto();
        dto.setOrganizationId(org.getOrganizationId());
        dto.setOrganizationUuid(org.getOrganizationUuid().toString());
        dto.setOrganizationName(org.getName());

        SubscriptionPlan plan = planRepository.findByPlanCode("CLUB_ACCESS_PASS")
                .orElseGet(() -> planRepository.findAll().stream().filter(p -> "CLUB".equalsIgnoreCase(p.getTargetModule())).findFirst().orElse(null));

        Optional<OrganizationSubscription> subOpt = orgSubRepository.findByOrganizationIdAndStatus(orgId, "ACTIVE");

        LocalDateTime now = LocalDateTime.now();

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
                dto.setDaysRemaining(30L);
                dto.setIsExpired(false);
            }
        } else {
            // Check 30-Day Free Trial based on organization creation date
            LocalDateTime createdAt = org.getCreatedAt() != null ? org.getCreatedAt() : now;
            long daysSinceCreation = ChronoUnit.DAYS.between(createdAt, now);
            long trialRemaining = Math.max(0, 30L - daysSinceCreation);

            dto.setStartDate(createdAt);
            dto.setEndDate(createdAt.plusDays(30));
            dto.setDaysRemaining(trialRemaining);
            dto.setBillingCycle("MONTHLY");

            if (trialRemaining > 0) {
                dto.setSubscriptionStatus("TRIAL");
                dto.setIsTrialActive(true);
                dto.setIsExpired(false);
            } else {
                dto.setSubscriptionStatus("EXPIRED");
                dto.setIsTrialActive(false);
                dto.setIsExpired(true);
            }
        }

        if (plan != null) {
            dto.setActivePlanCode(plan.getPlanCode());
            dto.setActivePlanName(plan.getName());

            Optional<SubscriptionPlanVersion> versionOpt = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(plan.getPlanId());
            if (versionOpt.isPresent()) {
                SubscriptionPlanVersion version = versionOpt.get();
                List<SubscriptionPlanFeature> features = featureRepository.findByVersionId(version.getVersionId());
                Map<String, Boolean> featMap = new HashMap<>();
                features.forEach(f -> featMap.put(f.getFeatureCode(), f.getIsEnabled() != null && f.getIsEnabled()));
                dto.setFeatures(featMap);

                List<SubscriptionPlanLimit> limits = limitRepository.findByVersionId(version.getVersionId());
                Map<String, Integer> limitMap = new HashMap<>();
                limits.forEach(l -> limitMap.put(l.getLimitCode(), l.getLimitValue()));
                dto.setMaxMembers(limitMap.getOrDefault("MAX_MEMBERS", 100));
                dto.setMaxManagers(limitMap.getOrDefault("MAX_MANAGERS", 3));
            }
        } else {
            dto.setActivePlanCode("CLUB_ACCESS_PASS");
            dto.setActivePlanName("Club Batch Pass");
            dto.setMaxMembers(100);
            dto.setMaxManagers(3);
            dto.setFeatures(Map.of(
                    "CLUB_BATCH_MANAGEMENT", true,
                    "CLUB_ATTENDANCE", true,
                    "CLUB_FEE_TRACKING", true,
                    "CLUB_EXPENSE_KITTY", true,
                    "CLUB_LEADERBOARD", true,
                    "CLUB_MATCH_SCORING", true,
                    "CLUB_INVENTORY", true
            ));
        }

        // Current Roster Usage
        long memberCount = memberRepository.countByOrganizationIdAndIsActive(orgId, 1);
        dto.setCurrentMembers(memberCount);

        long managerCount = memberRepository.findByOrganizationId(orgId).stream()
                .filter(m -> {
                    String role = m.getRole();
                    return role != null && (
                            role.equalsIgnoreCase("OWNER") ||
                            role.equalsIgnoreCase("ADMIN") ||
                            role.equalsIgnoreCase("CAPTAIN") ||
                            role.equalsIgnoreCase("MANAGER")
                    );
                })
                .count();
        dto.setCurrentManagers(managerCount);

        return dto;
    }

    @Transactional
    public void validateMemberCapacity(Long orgId) {
        ClubEntitlementSummaryDto entitlements = getClubEntitlements(orgId);

        if (Boolean.TRUE.equals(entitlements.getIsExpired())) {
            throw new SubscriptionEntitlementException(
                    "Your club 30-day free trial has expired. Please subscribe for ₹249/month to continue adding members and running club batches."
            );
        }

        if (entitlements.getMaxMembers() != null && entitlements.getCurrentMembers() >= entitlements.getMaxMembers()) {
            throw new SubscriptionEntitlementException(
                    "Club member limit reached (" + entitlements.getMaxMembers() + "). Please upgrade or manage existing member roster."
            );
        }
    }

    @Transactional
    public ClubEntitlementSummaryDto subscribeClubPlan(SubscribeClubPlanRequest request) {
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

        SubscriptionPlan plan = planRepository.findByPlanCode("CLUB_ACCESS_PASS")
                .orElseThrow(() -> new ResourceNotFoundException("Club Subscription Plan not found: CLUB_ACCESS_PASS"));

        SubscriptionPlanVersion version = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(plan.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("No published version for plan: CLUB_ACCESS_PASS"));

        // Close any existing active subscription
        orgSubRepository.findByOrganizationIdAndStatus(org.getOrganizationId(), "ACTIVE")
                .ifPresent(existing -> {
                    existing.setStatus("SUPERSEDED");
                    orgSubRepository.save(existing);
                });

        LocalDateTime now = LocalDateTime.now();
        String cycle = request.getBillingCycle() != null ? request.getBillingCycle().toUpperCase() : "MONTHLY";
        LocalDateTime endDate = "YEARLY".equals(cycle) ? now.plusYears(1) : now.plusMonths(1);

        OrganizationSubscription sub = new OrganizationSubscription();
        sub.setOrganizationId(org.getOrganizationId());
        sub.setPackageId(plan.getPlanId());
        sub.setVersionId(version.getVersionId());
        sub.setBillingCycle(cycle);
        sub.setStartDate(now);
        sub.setEndDate(endDate);
        sub.setStatus("ACTIVE");
        sub.setPaymentReference(request.getPaymentReference() != null ? request.getPaymentReference() : "WEB_SUB_" + System.currentTimeMillis());

        orgSubRepository.save(sub);

        return getClubEntitlements(org.getOrganizationId());
    }
}

