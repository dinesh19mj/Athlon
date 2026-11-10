package com.athlon.identityservice.subscription.service;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.exception.SubscriptionEntitlementException;
import com.athlon.identityservice.oganizationsubscription.entity.OrganizationSubscription;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.AcademyCentreRepository;
import com.athlon.identityservice.organization.repository.AcademyStaffRepository;
import com.athlon.identityservice.organization.repository.AcademyStudentRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.organizationsubscription.repository.OrganizationSubscriptionRepository;
import com.athlon.identityservice.subscription.dto.AcademyEntitlementSummaryDto;
import com.athlon.identityservice.subscription.dto.AcademySubscriptionPlanDto;
import com.athlon.identityservice.subscription.dto.request.PurchaseAcademyAddonRequest;
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
public class AcademyEntitlementService {

    private static final Logger log = LoggerFactory.getLogger(AcademyEntitlementService.class);

    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionPlanVersionRepository versionRepository;
    private final SubscriptionPlanPriceRepository priceRepository;
    private final SubscriptionPlanLimitRepository limitRepository;
    private final SubscriptionPlanFeatureRepository featureRepository;
    private final OrganizationSubscriptionRepository orgSubRepository;
    private final OrganizationSubscriptionAddonRepository addonRepository;
    private final OrganizationRepository organizationRepository;

    private final AcademyStudentRepository studentRepository;
    private final AcademyStaffRepository staffRepository;
    private final AcademyCentreRepository centreRepository;

    public AcademyEntitlementService(
            SubscriptionPlanRepository planRepository,
            SubscriptionPlanVersionRepository versionRepository,
            SubscriptionPlanPriceRepository priceRepository,
            SubscriptionPlanLimitRepository limitRepository,
            SubscriptionPlanFeatureRepository featureRepository,
            OrganizationSubscriptionRepository orgSubRepository,
            OrganizationSubscriptionAddonRepository addonRepository,
            OrganizationRepository organizationRepository,
            AcademyStudentRepository studentRepository,
            AcademyStaffRepository staffRepository,
            AcademyCentreRepository centreRepository
    ) {
        this.planRepository = planRepository;
        this.versionRepository = versionRepository;
        this.priceRepository = priceRepository;
        this.limitRepository = limitRepository;
        this.featureRepository = featureRepository;
        this.orgSubRepository = orgSubRepository;
        this.addonRepository = addonRepository;
        this.organizationRepository = organizationRepository;
        this.studentRepository = studentRepository;
        this.staffRepository = staffRepository;
        this.centreRepository = centreRepository;
    }

    @PostConstruct
    @Transactional
    public void init() {
        seedDefaultAcademyPlans();
    }

    @Transactional
    public void seedDefaultAcademyPlans() {
        if (planRepository.findByPlanCode("ACADEMY_STARTER").isPresent()) {
            return;
        }

        log.info("Seeding Default Academy Organization Subscription Plans...");

        // 1. FREE PLAN
        createAcademyPlanHierarchy(
                "ACADEMY_FREE",
                "Grassroots Free",
                "Grassroots coaching for individual trainers with up to 15 students and 1 batch",
                0,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                Map.of(
                        "MAX_STUDENTS", 15,
                        "MAX_COACHES", 1,
                        "MAX_CENTRES", 1,
                        "MAX_BATCHES", 1
                ),
                Set.of(
                        "ACADEMY_BASIC_ROSTER",
                        "ACADEMY_ATTENDANCE",
                        "ACADEMY_FEE_TRACKING"
                )
        );

        // 2. STARTER PLAN
        createAcademyPlanHierarchy(
                "ACADEMY_STARTER",
                "Academy Starter",
                "Single-campus academy with up to 60 students, 3 coaches, unlimited batches and fee reminders",
                1,
                BigDecimal.valueOf(999),
                BigDecimal.valueOf(9999),
                Map.of(
                        "MAX_STUDENTS", 60,
                        "MAX_COACHES", 3,
                        "MAX_CENTRES", 1,
                        "MAX_BATCHES", 999999
                ),
                Set.of(
                        "ACADEMY_BASIC_ROSTER",
                        "ACADEMY_ATTENDANCE",
                        "ACADEMY_FEE_TRACKING",
                        "ACADEMY_DIGITAL_ID",
                        "ACADEMY_FEE_REMINDERS",
                        "ACADEMY_PARENT_NOTICES"
                )
        );

        // 3. PROFESSIONAL PLAN
        createAcademyPlanHierarchy(
                "ACADEMY_PRO",
                "Academy Professional",
                "Multi-campus coaching institute with up to 250 students, 10 coaches, skill evaluations, and internal matches",
                2,
                BigDecimal.valueOf(2499),
                BigDecimal.valueOf(24999),
                Map.of(
                        "MAX_STUDENTS", 250,
                        "MAX_COACHES", 10,
                        "MAX_CENTRES", 3,
                        "MAX_BATCHES", 999999
                ),
                Set.of(
                        "ACADEMY_BASIC_ROSTER",
                        "ACADEMY_ATTENDANCE",
                        "ACADEMY_FEE_TRACKING",
                        "ACADEMY_DIGITAL_ID",
                        "ACADEMY_FEE_REMINDERS",
                        "ACADEMY_PARENT_NOTICES",
                        "ACADEMY_SKILL_ASSESSMENT",
                        "ACADEMY_INTERNAL_MATCHES",
                        "ACADEMY_MULTI_CENTRE",
                        "ACADEMY_EQUIPMENT_INVENTORY"
                )
        );

        // 4. BUSINESS PLAN
        createAcademyPlanHierarchy(
                "ACADEMY_BUSINESS",
                "Elite High-Performance",
                "Large-scale sports school with up to 750 students, 30 coaches, 10 campuses, coach payroll, and parent app",
                3,
                BigDecimal.valueOf(4999),
                BigDecimal.valueOf(49999),
                Map.of(
                        "MAX_STUDENTS", 750,
                        "MAX_COACHES", 30,
                        "MAX_CENTRES", 10,
                        "MAX_BATCHES", 999999
                ),
                Set.of(
                        "ACADEMY_BASIC_ROSTER",
                        "ACADEMY_ATTENDANCE",
                        "ACADEMY_FEE_TRACKING",
                        "ACADEMY_DIGITAL_ID",
                        "ACADEMY_FEE_REMINDERS",
                        "ACADEMY_PARENT_NOTICES",
                        "ACADEMY_SKILL_ASSESSMENT",
                        "ACADEMY_INTERNAL_MATCHES",
                        "ACADEMY_MULTI_CENTRE",
                        "ACADEMY_EQUIPMENT_INVENTORY",
                        "ACADEMY_COACH_PAYROLL",
                        "ACADEMY_PARENT_PORTAL",
                        "ACADEMY_CUSTOM_BRANDING"
                )
        );

        log.info("Academy Organization Plans seeded successfully.");
    }

    private void createAcademyPlanHierarchy(
            String planCode,
            String name,
            String description,
            int displayOrder,
            BigDecimal monthlyPrice,
            BigDecimal yearlyPrice,
            Map<String, Integer> limits,
            Set<String> features
    ) {
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setPlanCode(planCode);
        plan.setName(name);
        plan.setDescription(description);
        plan.setTargetModule("ACADEMY");
        plan.setDisplayOrder(displayOrder);
        plan.setIsActive(1);
        plan = planRepository.save(plan);

        SubscriptionPlanVersion version = new SubscriptionPlanVersion();
        version.setPlanId(plan.getPlanId());
        version.setVersionNumber(1);
        version.setIsPublished(true);
        version.setMarketplaceCommissionRate(BigDecimal.ZERO);
        version = versionRepository.save(version);

        // Monthly Price
        SubscriptionPlanPrice mPrice = new SubscriptionPlanPrice(version.getVersionId(), "MONTHLY", monthlyPrice, "INR");
        priceRepository.save(mPrice);

        // Yearly Price
        SubscriptionPlanPrice yPrice = new SubscriptionPlanPrice(version.getVersionId(), "YEARLY", yearlyPrice, "INR");
        priceRepository.save(yPrice);

        // Limits
        for (Map.Entry<String, Integer> entry : limits.entrySet()) {
            SubscriptionPlanLimit limit = new SubscriptionPlanLimit(version.getVersionId(), entry.getKey(), entry.getValue());
            limitRepository.save(limit);
        }

        // Features
        for (String featCode : features) {
            SubscriptionPlanFeature feat = new SubscriptionPlanFeature(version.getVersionId(), featCode, true);
            featureRepository.save(feat);
        }
    }

    @Transactional(readOnly = true)
    public List<AcademySubscriptionPlanDto> getAllAcademyPlans() {
        List<SubscriptionPlan> plans = planRepository.findByTargetModuleOrderByDisplayOrderAsc("ACADEMY");
        return plans.stream()
                .filter(p -> p.getIsActive() != null && p.getIsActive() == 1)
                .map(this::mapToAcademyPlanDto)
                .collect(Collectors.toList());
    }

    private AcademySubscriptionPlanDto mapToAcademyPlanDto(SubscriptionPlan plan) {
        AcademySubscriptionPlanDto dto = new AcademySubscriptionPlanDto();
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

            dto.setMaxStudents(limitMap.getOrDefault("MAX_STUDENTS", 15));
            dto.setMaxCoaches(limitMap.getOrDefault("MAX_COACHES", 1));
            dto.setMaxCentres(limitMap.getOrDefault("MAX_CENTRES", 1));

            List<SubscriptionPlanFeature> features = featureRepository.findByVersionId(version.getVersionId());
            Map<String, Boolean> featMap = new HashMap<>();
            features.forEach(f -> featMap.put(f.getFeatureCode(), f.getIsEnabled() != null && f.getIsEnabled()));
            dto.setFeatures(featMap);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public AcademyEntitlementSummaryDto getAcademyEntitlements(UUID orgUuid) {
        Organization org = organizationRepository.findByOrganizationUuid(orgUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + orgUuid));
        return getAcademyEntitlements(org.getOrganizationId());
    }

    @Transactional(readOnly = true)
    public AcademyEntitlementSummaryDto getAcademyEntitlements(Long orgId) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + orgId));

        AcademyEntitlementSummaryDto dto = new AcademyEntitlementSummaryDto();
        dto.setOrganizationId(org.getOrganizationId());
        dto.setOrganizationUuid(org.getOrganizationUuid().toString());
        dto.setOrganizationName(org.getName());

        // 1. Resolve Active Subscription
        Optional<OrganizationSubscription> subOpt = orgSubRepository.findByOrganizationIdAndStatus(orgId, "ACTIVE");

        SubscriptionPlan plan;
        SubscriptionPlanVersion version;
        Long subscriptionId = null;

        if (subOpt.isPresent()) {
            OrganizationSubscription sub = subOpt.get();
            subscriptionId = sub.getOrganizationSubscriptionId();
            dto.setSubscriptionStatus(sub.getStatus());
            dto.setBillingCycle(sub.getBillingCycle());
            dto.setStartDate(sub.getStartDate());
            dto.setEndDate(sub.getEndDate());
            if (sub.getEndDate() != null) {
                dto.setDaysRemaining(Math.max(0, ChronoUnit.DAYS.between(LocalDateTime.now(), sub.getEndDate())));
            }

            plan = planRepository.findById(sub.getPackageId())
                    .orElseGet(() -> planRepository.findByPlanCode("ACADEMY_FREE").orElse(null));

            version = sub.getVersionId() != null
                    ? versionRepository.findById(sub.getVersionId()).orElse(null)
                    : null;
            if (version == null && plan != null) {
                version = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(plan.getPlanId()).orElse(null);
            }
        } else {
            // Default Grassroots Free
            plan = planRepository.findByPlanCode("ACADEMY_FREE").orElse(null);
            version = plan != null ? versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(plan.getPlanId()).orElse(null) : null;
            dto.setSubscriptionStatus("FREE_TIER");
            dto.setBillingCycle("MONTHLY");
        }

        if (plan != null) {
            dto.setActivePlanCode(plan.getPlanCode());
            dto.setActivePlanName(plan.getName());
        }

        // 2. Base Quotas
        int baseStudents = 15;
        int baseCoaches = 1;
        int baseCentres = 1;

        if (version != null) {
            List<SubscriptionPlanLimit> limits = limitRepository.findByVersionId(version.getVersionId());
            for (SubscriptionPlanLimit lim : limits) {
                if ("MAX_STUDENTS".equalsIgnoreCase(lim.getLimitCode())) baseStudents = lim.getLimitValue();
                if ("MAX_COACHES".equalsIgnoreCase(lim.getLimitCode())) baseCoaches = lim.getLimitValue();
                if ("MAX_CENTRES".equalsIgnoreCase(lim.getLimitCode())) baseCentres = lim.getLimitValue();
            }

            List<SubscriptionPlanFeature> features = featureRepository.findByVersionId(version.getVersionId());
            Map<String, Boolean> featMap = new HashMap<>();
            features.forEach(f -> featMap.put(f.getFeatureCode(), f.getIsEnabled() != null && f.getIsEnabled()));
            dto.setFeatures(featMap);
        }

        // 3. Add-on Allowances
        int addonStudents = 0;
        int addonCoaches = 0;
        int addonCentres = 0;
        List<AcademyEntitlementSummaryDto.AddonSummaryDto> addonDtos = new ArrayList<>();

        if (subscriptionId != null) {
            List<OrganizationSubscriptionAddon> addons = addonRepository.findBySubscriptionIdAndStatus(subscriptionId, "ACTIVE");
            for (OrganizationSubscriptionAddon addon : addons) {
                AcademyEntitlementSummaryDto.AddonSummaryDto aDto = new AcademyEntitlementSummaryDto.AddonSummaryDto();
                aDto.setAddonId(addon.getAddonId());
                aDto.setAddonType(addon.getAddonType());
                aDto.setQuantity(addon.getQuantity());
                aDto.setEndDate(addon.getEndDate());
                aDto.setStatus(addon.getStatus());
                addonDtos.add(aDto);

                if ("STUDENT_PACK".equalsIgnoreCase(addon.getAddonType())) {
                    addonStudents += (addon.getQuantity() * 50); // Each pack is +50 students
                } else if ("COACH".equalsIgnoreCase(addon.getAddonType())) {
                    addonCoaches += addon.getQuantity();
                } else if ("CAMPUS".equalsIgnoreCase(addon.getAddonType()) || "CENTRE".equalsIgnoreCase(addon.getAddonType())) {
                    addonCentres += addon.getQuantity();
                }
            }
        }

        dto.setAddonStudents(addonStudents);
        dto.setAddonCoaches(addonCoaches);
        dto.setAddonCentres(addonCentres);
        dto.setActiveAddons(addonDtos);

        dto.setMaxStudents(baseStudents + addonStudents);
        dto.setMaxCoaches(baseCoaches + addonCoaches);
        dto.setMaxCentres(baseCentres + addonCentres);

        // 4. Current Usages
        long currentStudents = studentRepository.countByOrganizationUuid(org.getOrganizationUuid());
        long currentCoaches = staffRepository.countByOrganizationUuidAndIsActive(org.getOrganizationUuid(), 1);
        long currentCentres = centreRepository.countByOrganizationUuid(org.getOrganizationUuid());

        dto.setCurrentStudents(currentStudents);
        dto.setCurrentCoaches(currentCoaches);
        dto.setCurrentCentres(Math.max(1, currentCentres));

        return dto;
    }

    /**
     * Validates whether a new student admission can be accepted under active tier.
     */
    @Transactional(readOnly = true)
    public void validateStudentCapacity(Long orgId) {
        AcademyEntitlementSummaryDto summary = getAcademyEntitlements(orgId);
        if (summary.getCurrentStudents() >= summary.getMaxStudents()) {
            throw new SubscriptionEntitlementException(
                    String.format("Student capacity reached (%d/%d enrolled) on %s. Please upgrade to a higher tier or add a +50 Trainees Pack.",
                            summary.getCurrentStudents(), summary.getMaxStudents(), summary.getActivePlanName()),
                    summary.getActivePlanCode(),
                    "MAX_STUDENTS"
            );
        }
    }

    @Transactional(readOnly = true)
    public void validateStudentCapacity(UUID orgUuid) {
        AcademyEntitlementSummaryDto summary = getAcademyEntitlements(orgUuid);
        if (summary.getCurrentStudents() >= summary.getMaxStudents()) {
            throw new SubscriptionEntitlementException(
                    String.format("Student capacity reached (%d/%d enrolled) on %s. Please upgrade to a higher tier or add a +50 Trainees Pack.",
                            summary.getCurrentStudents(), summary.getMaxStudents(), summary.getActivePlanName()),
                    summary.getActivePlanCode(),
                    "MAX_STUDENTS"
            );
        }
    }

    /**
     * Validates coach invitation / account creation under active tier.
     */
    @Transactional(readOnly = true)
    public void validateCoachCapacity(Long orgId) {
        AcademyEntitlementSummaryDto summary = getAcademyEntitlements(orgId);
        if (summary.getCurrentCoaches() >= summary.getMaxCoaches()) {
            throw new SubscriptionEntitlementException(
                    String.format("Coach seat limit reached (%d/%d active coaches) on %s. Please upgrade your plan or add coach seats.",
                            summary.getCurrentCoaches(), summary.getMaxCoaches(), summary.getActivePlanName()),
                    summary.getActivePlanCode(),
                    "MAX_COACHES"
            );
        }
    }

    @Transactional(readOnly = true)
    public void validateCoachCapacity(UUID orgUuid) {
        AcademyEntitlementSummaryDto summary = getAcademyEntitlements(orgUuid);
        if (summary.getCurrentCoaches() >= summary.getMaxCoaches()) {
            throw new SubscriptionEntitlementException(
                    String.format("Coach seat limit reached (%d/%d active coaches) on %s. Please upgrade your plan or add coach seats.",
                            summary.getCurrentCoaches(), summary.getMaxCoaches(), summary.getActivePlanName()),
                    summary.getActivePlanCode(),
                    "MAX_COACHES"
            );
        }
    }

    /**
     * Validates centre / campus creation under active tier.
     */
    @Transactional(readOnly = true)
    public void validateCentreCapacity(Long orgId) {
        AcademyEntitlementSummaryDto summary = getAcademyEntitlements(orgId);
        if (summary.getCurrentCentres() >= summary.getMaxCentres()) {
            throw new SubscriptionEntitlementException(
                    String.format("Campus branch limit reached (%d/%d centres) on %s. Please upgrade to Academy Professional or Business tier.",
                            summary.getCurrentCentres(), summary.getMaxCentres(), summary.getActivePlanName()),
                    summary.getActivePlanCode(),
                    "MAX_CENTRES"
            );
        }
    }

    @Transactional(readOnly = true)
    public void validateCentreCapacity(UUID orgUuid) {
        AcademyEntitlementSummaryDto summary = getAcademyEntitlements(orgUuid);
        if (summary.getCurrentCentres() >= summary.getMaxCentres()) {
            throw new SubscriptionEntitlementException(
                    String.format("Campus branch limit reached (%d/%d centres) on %s. Please upgrade to Academy Professional or Business tier.",
                            summary.getCurrentCentres(), summary.getMaxCentres(), summary.getActivePlanName()),
                    summary.getActivePlanCode(),
                    "MAX_CENTRES"
            );
        }
    }

    /**
     * Subscribes or upgrades an organization to an Academy subscription tier.
     */
    @Transactional
    public AcademyEntitlementSummaryDto subscribeAcademyPlan(com.athlon.identityservice.subscription.dto.request.SubscribeAcademyPlanRequest request) {
        Organization org = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + request.getOrganizationId()));

        SubscriptionPlan plan = planRepository.findByPlanCode(request.getPlanCode())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found: " + request.getPlanCode()));

        SubscriptionPlanVersion version = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(plan.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("No published version for plan: " + plan.getPlanCode()));

        // Expire previous active subscription
        orgSubRepository.findByOrganizationIdAndStatus(org.getOrganizationId(), "ACTIVE")
                .ifPresent(oldSub -> {
                    oldSub.setStatus("EXPIRED");
                    orgSubRepository.save(oldSub);
                });

        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = "YEARLY".equalsIgnoreCase(request.getBillingCycle())
                ? startDate.plusYears(1)
                : startDate.plusMonths(1);

        OrganizationSubscription newSub = new OrganizationSubscription();
        newSub.setOrganizationId(org.getOrganizationId());
        newSub.setPackageId(plan.getPlanId());
        newSub.setVersionId(version.getVersionId());
        newSub.setBillingCycle(request.getBillingCycle() != null ? request.getBillingCycle().toUpperCase() : "MONTHLY");
        newSub.setStatus("ACTIVE");
        newSub.setStartDate(startDate);
        newSub.setEndDate(endDate);

        orgSubRepository.save(newSub);

        log.info("Organization {} subscribed to Academy Plan {} ({})", org.getOrganizationId(), plan.getPlanCode(), request.getBillingCycle());
        return getAcademyEntitlements(org.getOrganizationId());
    }

    /**
     * Purchases an add-on booster pack (e.g., +50 Students, +1 Campus, +1 Coach).
     */
    @Transactional
    public AcademyEntitlementSummaryDto purchaseAddon(PurchaseAcademyAddonRequest request) {
        Organization org = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + request.getOrganizationId()));

        OrganizationSubscription sub = orgSubRepository.findByOrganizationIdAndStatus(request.getOrganizationId(), "ACTIVE")
                .orElseGet(() -> {
                    // Auto-enroll in Starter if buying an add-on
                    SubscriptionPlan plan = planRepository.findByPlanCode("ACADEMY_STARTER")
                            .orElseThrow(() -> new ResourceNotFoundException("Plan not found: ACADEMY_STARTER"));
                    SubscriptionPlanVersion ver = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(plan.getPlanId())
                            .orElseThrow(() -> new ResourceNotFoundException("No published version"));

                    OrganizationSubscription newSub = new OrganizationSubscription();
                    newSub.setOrganizationId(request.getOrganizationId());
                    newSub.setPackageId(plan.getPlanId());
                    newSub.setVersionId(ver.getVersionId());
                    newSub.setBillingCycle("MONTHLY");
                    newSub.setStatus("ACTIVE");
                    newSub.setStartDate(LocalDateTime.now());
                    newSub.setEndDate(LocalDateTime.now().plusMonths(1));
                    return orgSubRepository.save(newSub);
                });

        BigDecimal unitPrice = BigDecimal.valueOf(499);
        if ("COACH".equalsIgnoreCase(request.getAddonType())) unitPrice = BigDecimal.valueOf(299);
        if ("CAMPUS".equalsIgnoreCase(request.getAddonType()) || "CENTRE".equalsIgnoreCase(request.getAddonType())) unitPrice = BigDecimal.valueOf(799);

        int durationMonths = request.getDurationMonths() != null && request.getDurationMonths() > 0 ? request.getDurationMonths() : 1;
        LocalDateTime endDate = LocalDateTime.now().plusMonths(durationMonths);

        OrganizationSubscriptionAddon addon = new OrganizationSubscriptionAddon(
                sub.getOrganizationSubscriptionId(),
                request.getAddonType(),
                request.getQuantity(),
                unitPrice,
                endDate
        );
        addonRepository.save(addon);

        log.info("Academy Add-on {} (qty: {}) purchased successfully for org {}", request.getAddonType(), request.getQuantity(), request.getOrganizationId());
        return getAcademyEntitlements(request.getOrganizationId());
    }
}
