package com.athlon.identityservice.subscription.service;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.exception.SubscriptionEntitlementException;
import com.athlon.identityservice.oganizationsubscription.entity.OrganizationSubscription;
import com.athlon.identityservice.organizationsubscription.repository.OrganizationSubscriptionRepository;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.CoachTraineeRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.subscription.dto.CoachEntitlementSummaryDto;
import com.athlon.identityservice.subscription.dto.CoachSubscriptionPlanDto;
import com.athlon.identityservice.subscription.dto.request.SubscribeCoachPlanRequest;
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
public class CoachEntitlementService {

    private static final Logger log = LoggerFactory.getLogger(CoachEntitlementService.class);

    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionPlanVersionRepository versionRepository;
    private final SubscriptionPlanPriceRepository priceRepository;
    private final SubscriptionPlanLimitRepository limitRepository;
    private final SubscriptionPlanFeatureRepository featureRepository;
    private final OrganizationSubscriptionRepository orgSubRepository;
    private final OrganizationRepository organizationRepository;
    private final CoachTraineeRepository coachTraineeRepository;

    public CoachEntitlementService(
            SubscriptionPlanRepository planRepository,
            SubscriptionPlanVersionRepository versionRepository,
            SubscriptionPlanPriceRepository priceRepository,
            SubscriptionPlanLimitRepository limitRepository,
            SubscriptionPlanFeatureRepository featureRepository,
            OrganizationSubscriptionRepository orgSubRepository,
            OrganizationRepository organizationRepository,
            CoachTraineeRepository coachTraineeRepository
    ) {
        this.planRepository = planRepository;
        this.versionRepository = versionRepository;
        this.priceRepository = priceRepository;
        this.limitRepository = limitRepository;
        this.featureRepository = featureRepository;
        this.orgSubRepository = orgSubRepository;
        this.organizationRepository = organizationRepository;
        this.coachTraineeRepository = coachTraineeRepository;
    }

    @PostConstruct
    @Transactional
    public void init() {
        seedDefaultCoachPlans();
    }

    @Transactional
    public void seedDefaultCoachPlans() {
        if (planRepository.findByPlanCode("COACH_STARTER").isEmpty()) {
            log.info("Seeding Default Coach Starter (30-Day Free Trial, then ₹299/mo) Plan...");

            SubscriptionPlan starterPlan = new SubscriptionPlan(
                    "COACH_STARTER",
                    "Coach Starter",
                    "Manage personal coaching calendar, slot bookings, student roster & cash/digital fee logging. First 30 days free, then ₹299/month.",
                    "COACH",
                    0
            );
            starterPlan.setIsActive(1);
            starterPlan = planRepository.save(starterPlan);

            SubscriptionPlanVersion starterVer = new SubscriptionPlanVersion();
            starterVer.setPlanId(starterPlan.getPlanId());
            starterVer.setVersionNumber(1);
            starterVer.setIsPublished(true);
            starterVer.setMarketplaceCommissionRate(BigDecimal.ZERO);
            starterVer = versionRepository.save(starterVer);

            priceRepository.save(new SubscriptionPlanPrice(starterVer.getVersionId(), "MONTHLY", BigDecimal.valueOf(299), "INR"));
            priceRepository.save(new SubscriptionPlanPrice(starterVer.getVersionId(), "YEARLY", BigDecimal.valueOf(2990), "INR"));

            Map<String, Integer> starterLimits = Map.of(
                    "MAX_TRAINEES", 15,
                    "TRIAL_DAYS", 30,
                    "MAX_PACKAGES", 3,
                    "MAX_SESSIONS", 9999
            );
            for (Map.Entry<String, Integer> entry : starterLimits.entrySet()) {
                limitRepository.save(new SubscriptionPlanLimit(starterVer.getVersionId(), entry.getKey(), entry.getValue()));
            }

            Map<String, Boolean> starterFeatures = Map.of(
                    "COACH_CALENDAR", true,
                    "COACH_ATTENDANCE", true,
                    "COACH_FEE_TRACKING", true,
                    "COACH_PROFILE", true,
                    "COACH_DRILL_CARDS", false,
                    "COACH_AUTO_REMINDERS", false,
                    "COACH_VERIFIED_BADGE", false
            );
            for (Map.Entry<String, Boolean> entry : starterFeatures.entrySet()) {
                featureRepository.save(new SubscriptionPlanFeature(starterVer.getVersionId(), entry.getKey(), entry.getValue()));
            }
        }

        if (planRepository.findByPlanCode("COACH_PRO").isEmpty()) {
            log.info("Seeding Default Coach Professional (₹499/mo, 50 Trainees) Plan...");

            SubscriptionPlan proPlan = new SubscriptionPlan(
                    "COACH_PRO",
                    "Coach Professional",
                    "Up to 50 trainees, trainee drill cards, fitness test benchmarks, automated fee payment reminders & verified discovery badge.",
                    "COACH",
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

            priceRepository.save(new SubscriptionPlanPrice(proVer.getVersionId(), "MONTHLY", BigDecimal.valueOf(499), "INR"));
            priceRepository.save(new SubscriptionPlanPrice(proVer.getVersionId(), "YEARLY", BigDecimal.valueOf(4990), "INR"));

            Map<String, Integer> proLimits = Map.of(
                    "MAX_TRAINEES", 50,
                    "TRIAL_DAYS", 0,
                    "MAX_PACKAGES", 9999,
                    "MAX_SESSIONS", 9999
            );
            for (Map.Entry<String, Integer> entry : proLimits.entrySet()) {
                limitRepository.save(new SubscriptionPlanLimit(proVer.getVersionId(), entry.getKey(), entry.getValue()));
            }

            Map<String, Boolean> proFeatures = Map.of(
                    "COACH_CALENDAR", true,
                    "COACH_ATTENDANCE", true,
                    "COACH_FEE_TRACKING", true,
                    "COACH_PROFILE", true,
                    "COACH_DRILL_CARDS", true,
                    "COACH_AUTO_REMINDERS", true,
                    "COACH_VERIFIED_BADGE", true,
                    "COACH_VIDEO_ANALYSIS", true
            );
            for (Map.Entry<String, Boolean> entry : proFeatures.entrySet()) {
                featureRepository.save(new SubscriptionPlanFeature(proVer.getVersionId(), entry.getKey(), entry.getValue()));
            }
        }

        log.info("Coach subscription plans seeded successfully: COACH_STARTER, COACH_PRO.");
    }

    @Transactional(readOnly = true)
    public List<CoachSubscriptionPlanDto> getAllCoachPlans() {
        List<SubscriptionPlan> plans = planRepository.findByTargetModuleOrderByDisplayOrderAsc("COACH");
        return plans.stream()
                .filter(p -> p.getIsActive() != null && p.getIsActive() == 1)
                .map(this::mapToCoachPlanDto)
                .collect(Collectors.toList());
    }

    private CoachSubscriptionPlanDto mapToCoachPlanDto(SubscriptionPlan plan) {
        CoachSubscriptionPlanDto dto = new CoachSubscriptionPlanDto();
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

            dto.setMaxTrainees(limitMap.getOrDefault("MAX_TRAINEES", "COACH_PRO".equalsIgnoreCase(plan.getPlanCode()) ? 50 : 15));
            dto.setTrialDays(limitMap.getOrDefault("TRIAL_DAYS", "COACH_STARTER".equalsIgnoreCase(plan.getPlanCode()) ? 30 : 0));

            List<SubscriptionPlanFeature> features = featureRepository.findByVersionId(version.getVersionId());
            Map<String, Boolean> featMap = new HashMap<>();
            features.forEach(f -> featMap.put(f.getFeatureCode(), f.getIsEnabled() != null && f.getIsEnabled()));
            dto.setFeatures(featMap);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public CoachEntitlementSummaryDto getCoachEntitlements(UUID orgUuid) {
        Organization org = organizationRepository.findByOrganizationUuid(orgUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + orgUuid));
        return getCoachEntitlements(org);
    }

    @Transactional(readOnly = true)
    public CoachEntitlementSummaryDto getCoachEntitlements(Long orgId) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with ID: " + orgId));
        return getCoachEntitlements(org);
    }

    private CoachEntitlementSummaryDto getCoachEntitlements(Organization org) {
        CoachEntitlementSummaryDto dto = new CoachEntitlementSummaryDto();
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
                dto.setDaysRemaining(30L);
                dto.setIsExpired(false);
            }

            activePlan = planRepository.findById(sub.getPackageId()).orElse(null);
            if (activePlan != null) {
                activeVersion = versionRepository.findById(sub.getVersionId()).orElse(null);
            }
        } else {
            // Check 30-Day Free Trial on Coach Starter
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

            activePlan = planRepository.findByPlanCode("COACH_STARTER").orElse(null);
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
                dto.setMaxTrainees(limitMap.getOrDefault("MAX_TRAINEES", "COACH_PRO".equalsIgnoreCase(activePlan.getPlanCode()) ? 50 : 15));

                List<SubscriptionPlanFeature> features = featureRepository.findByVersionId(activeVersion.getVersionId());
                Map<String, Boolean> featMap = new HashMap<>();
                features.forEach(f -> featMap.put(f.getFeatureCode(), f.getIsEnabled() != null && f.getIsEnabled()));
                dto.setFeatures(featMap);
            }
        } else {
            dto.setActivePlanCode("COACH_STARTER");
            dto.setActivePlanName("Coach Starter");
            dto.setMaxTrainees(15);
            dto.setFeatures(Map.of(
                    "COACH_CALENDAR", true,
                    "COACH_ATTENDANCE", true,
                    "COACH_FEE_TRACKING", true,
                    "COACH_PROFILE", true
            ));
        }

        // Active Trainee Roster Usage
        long currentTrainees = coachTraineeRepository.countByOrganizationUuidAndStatus(org.getOrganizationUuid(), "ACTIVE");
        dto.setCurrentTrainees(currentTrainees);
        dto.setTraineesRemaining(Math.max(0, (dto.getMaxTrainees() != null ? dto.getMaxTrainees() : 15) - currentTrainees));

        return dto;
    }

    @Transactional
    public void validateTraineeCapacity(UUID orgUuid) {
        CoachEntitlementSummaryDto entitlements = getCoachEntitlements(orgUuid);

        if (Boolean.TRUE.equals(entitlements.getIsExpired())) {
            throw new SubscriptionEntitlementException(
                    "Your coach 30-day free trial has expired. Please subscribe for ₹299/month (or upgrade to Coach Pro) to continue adding trainees."
            );
        }

        if (entitlements.getMaxTrainees() != null && entitlements.getCurrentTrainees() >= entitlements.getMaxTrainees()) {
            throw new SubscriptionEntitlementException(
                    "Coach trainee limit reached (" + entitlements.getMaxTrainees() + " trainees). Please upgrade to Coach Pro for up to 50 trainees."
            );
        }
    }

    @Transactional
    public CoachEntitlementSummaryDto subscribeCoachPlan(SubscribeCoachPlanRequest request) {
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

        String targetCode = request.getPlanCode() != null ? request.getPlanCode() : "COACH_STARTER";
        SubscriptionPlan plan = planRepository.findByPlanCode(targetCode)
                .orElseThrow(() -> new ResourceNotFoundException("Coach Subscription Plan not found: " + targetCode));

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
        LocalDateTime endDate = "YEARLY".equals(cycle) ? now.plusYears(1) : now.plusMonths(1);

        OrganizationSubscription sub = new OrganizationSubscription();
        sub.setOrganizationId(org.getOrganizationId());
        sub.setPackageId(plan.getPlanId());
        sub.setVersionId(version.getVersionId());
        sub.setBillingCycle(cycle);
        sub.setStartDate(now);
        sub.setEndDate(endDate);
        sub.setStatus("ACTIVE");
        sub.setPaymentReference(request.getPaymentReference() != null ? request.getPaymentReference() : "WEB_COACH_" + System.currentTimeMillis());

        orgSubRepository.save(sub);

        return getCoachEntitlements(org);
    }
}
