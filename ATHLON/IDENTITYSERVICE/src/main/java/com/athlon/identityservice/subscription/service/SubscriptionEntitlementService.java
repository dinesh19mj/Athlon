package com.athlon.identityservice.subscription.service;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.exception.SubscriptionEntitlementException;
import com.athlon.identityservice.oganizationsubscription.entity.OrganizationSubscription;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.organization.repository.VenueStaffRepository;
import com.athlon.identityservice.organizationsubscription.repository.OrganizationSubscriptionRepository;
import com.athlon.identityservice.subscription.dto.request.SaveSubscriptionPlanRequest;
import com.athlon.identityservice.subscription.dto.VenueEntitlementSummaryDto;
import com.athlon.identityservice.subscription.dto.VenueSubscriptionPlanDto;
import com.athlon.identityservice.subscription.entity.*;
import com.athlon.identityservice.subscription.enums.VenueFeatureCode;
import com.athlon.identityservice.subscription.repository.*;
import com.athlon.identityservice.venue.entity.Venue;
import com.athlon.identityservice.venue.repository.VenueFacilityRepository;
import com.athlon.identityservice.venue.repository.VenueRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SubscriptionEntitlementService {

    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionPlanVersionRepository versionRepository;
    private final SubscriptionPlanPriceRepository priceRepository;
    private final SubscriptionPlanLimitRepository limitRepository;
    private final SubscriptionPlanFeatureRepository featureRepository;
    private final OrganizationSubscriptionAddonRepository addonRepository;
    private final OrganizationSubscriptionRepository orgSubRepository;
    private final OrganizationRepository organizationRepository;
    private final VenueRepository venueRepository;
    private final VenueFacilityRepository facilityRepository;
    private final VenueStaffRepository staffRepository;

    public SubscriptionEntitlementService(
            SubscriptionPlanRepository planRepository,
            SubscriptionPlanVersionRepository versionRepository,
            SubscriptionPlanPriceRepository priceRepository,
            SubscriptionPlanLimitRepository limitRepository,
            SubscriptionPlanFeatureRepository featureRepository,
            OrganizationSubscriptionAddonRepository addonRepository,
            OrganizationSubscriptionRepository orgSubRepository,
            OrganizationRepository organizationRepository,
            VenueRepository venueRepository,
            VenueFacilityRepository facilityRepository,
            VenueStaffRepository staffRepository
    ) {
        this.planRepository = planRepository;
        this.versionRepository = versionRepository;
        this.priceRepository = priceRepository;
        this.limitRepository = limitRepository;
        this.featureRepository = featureRepository;
        this.addonRepository = addonRepository;
        this.orgSubRepository = orgSubRepository;
        this.organizationRepository = organizationRepository;
        this.venueRepository = venueRepository;
        this.facilityRepository = facilityRepository;
        this.staffRepository = staffRepository;
    }

    @PostConstruct
    @Transactional
    public void init() {
        seedDefaultVenuePlans();
    }

    @Transactional
    public void seedDefaultVenuePlans() {
        if (planRepository.findByPlanCode("VENUE_STARTER").isPresent()) {
            return; // Already initialized
        }

        // 1. FREE PLAN
        createPlanHierarchy(
                "VENUE_FREE",
                "Venue Free",
                "Basic public listing and 1 bookable court for grassroots venue operators",
                0,
                BigDecimal.valueOf(8.00),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                Map.of("MAX_VENUES", 1, "MAX_FACILITIES", 1, "MAX_STAFF", 1),
                Set.of(VenueFeatureCode.VENUE_FACILITY_MANAGEMENT)
        );

        // 2. STARTER PLAN
        createPlanHierarchy(
                "VENUE_STARTER",
                "Venue Starter",
                "Full operational suite with dynamic pricing and recurring series for single facilities",
                1,
                BigDecimal.valueOf(5.00),
                BigDecimal.valueOf(499),
                BigDecimal.valueOf(4999),
                Map.of("MAX_VENUES", 1, "MAX_FACILITIES", 3, "MAX_STAFF", 2),
                Set.of(
                        VenueFeatureCode.VENUE_FACILITY_MANAGEMENT,
                        VenueFeatureCode.VENUE_DYNAMIC_PRICING,
                        VenueFeatureCode.VENUE_RECURRING_BOOKINGS
                )
        );

        // 3. PROFESSIONAL PLAN
        createPlanHierarchy(
                "VENUE_PRO",
                "Venue Professional",
                "Advanced player CRM, membership passes, POS kiosk, equipment rentals, and promotional coupons",
                2,
                BigDecimal.valueOf(3.00),
                BigDecimal.valueOf(999),
                BigDecimal.valueOf(9999),
                Map.of("MAX_VENUES", 1, "MAX_FACILITIES", 10, "MAX_STAFF", 5),
                Set.of(
                        VenueFeatureCode.VENUE_FACILITY_MANAGEMENT,
                        VenueFeatureCode.VENUE_DYNAMIC_PRICING,
                        VenueFeatureCode.VENUE_RECURRING_BOOKINGS,
                        VenueFeatureCode.VENUE_ADVANCED_CRM,
                        VenueFeatureCode.VENUE_MEMBERSHIPS,
                        VenueFeatureCode.VENUE_PREPAID_PACKAGES,
                        VenueFeatureCode.VENUE_COUPONS,
                        VenueFeatureCode.VENUE_LOYALTY,
                        VenueFeatureCode.VENUE_QR_CHECKIN,
                        VenueFeatureCode.VENUE_POS,
                        VenueFeatureCode.VENUE_EQUIPMENT_RENTAL,
                        VenueFeatureCode.VENUE_INVENTORY,
                        VenueFeatureCode.VENUE_EXPENSES,
                        VenueFeatureCode.VENUE_ADVANCED_ANALYTICS
                )
        );

        // 4. BUSINESS PLAN
        createPlanHierarchy(
                "VENUE_BUSINESS",
                "Venue Business",
                "Multi-branch operations, staff shifts, attendance & payroll, and inter-branch inventory transfers",
                3,
                BigDecimal.valueOf(1.50),
                BigDecimal.valueOf(2499),
                BigDecimal.valueOf(24999),
                Map.of("MAX_VENUES", 3, "MAX_FACILITIES", 25, "MAX_STAFF", 15),
                Set.of(
                        VenueFeatureCode.VENUE_FACILITY_MANAGEMENT,
                        VenueFeatureCode.VENUE_DYNAMIC_PRICING,
                        VenueFeatureCode.VENUE_RECURRING_BOOKINGS,
                        VenueFeatureCode.VENUE_ADVANCED_CRM,
                        VenueFeatureCode.VENUE_MEMBERSHIPS,
                        VenueFeatureCode.VENUE_PREPAID_PACKAGES,
                        VenueFeatureCode.VENUE_COUPONS,
                        VenueFeatureCode.VENUE_LOYALTY,
                        VenueFeatureCode.VENUE_QR_CHECKIN,
                        VenueFeatureCode.VENUE_POS,
                        VenueFeatureCode.VENUE_EQUIPMENT_RENTAL,
                        VenueFeatureCode.VENUE_INVENTORY,
                        VenueFeatureCode.VENUE_ADVANCED_INVENTORY,
                        VenueFeatureCode.VENUE_EXPENSES,
                        VenueFeatureCode.VENUE_ADVANCED_ANALYTICS,
                        VenueFeatureCode.VENUE_STAFF_ATTENDANCE,
                        VenueFeatureCode.VENUE_PAYROLL,
                        VenueFeatureCode.VENUE_ASSET_MANAGEMENT,
                        VenueFeatureCode.VENUE_CLEANING,
                        VenueFeatureCode.VENUE_MULTI_BRANCH
                )
        );

        // 5. ENTERPRISE PLAN
        createPlanHierarchy(
                "VENUE_ENTERPRISE",
                "Venue Enterprise",
                "Custom capacity, external booking channel sync, dedicated APIs, SSO, and negotiated SLA",
                4,
                BigDecimal.ZERO,
                BigDecimal.valueOf(9999),
                BigDecimal.valueOf(99999),
                Map.of("MAX_VENUES", 10, "MAX_FACILITIES", 100, "MAX_STAFF", 50),
                Arrays.stream(VenueFeatureCode.values()).collect(Collectors.toSet())
        );
    }

    private void createPlanHierarchy(
            String planCode,
            String name,
            String description,
            int displayOrder,
            BigDecimal commissionRate,
            BigDecimal monthlyPrice,
            BigDecimal yearlyPrice,
            Map<String, Integer> limits,
            Set<VenueFeatureCode> features
    ) {
        SubscriptionPlan plan = planRepository.save(new SubscriptionPlan(planCode, name, description, "VENUE", displayOrder));
        SubscriptionPlanVersion version = versionRepository.save(new SubscriptionPlanVersion(plan.getPlanId(), 1, commissionRate, true));

        priceRepository.save(new SubscriptionPlanPrice(version.getVersionId(), "MONTHLY", monthlyPrice, "INR"));
        priceRepository.save(new SubscriptionPlanPrice(version.getVersionId(), "YEARLY", yearlyPrice, "INR"));

        for (Map.Entry<String, Integer> entry : limits.entrySet()) {
            limitRepository.save(new SubscriptionPlanLimit(version.getVersionId(), entry.getKey(), entry.getValue()));
        }

        for (VenueFeatureCode feat : VenueFeatureCode.values()) {
            boolean enabled = features.contains(feat);
            featureRepository.save(new SubscriptionPlanFeature(version.getVersionId(), feat.name(), enabled));
        }
    }

    @Transactional(readOnly = true)
    public List<VenueSubscriptionPlanDto> getAllVenuePlans() {
        List<SubscriptionPlan> plans = planRepository.findByTargetModuleOrderByDisplayOrderAsc("VENUE");
        List<VenueSubscriptionPlanDto> dtos = new ArrayList<>();

        for (SubscriptionPlan plan : plans) {
            if (plan.getIsActive() != null && plan.getIsActive() == 0) continue;
            Optional<SubscriptionPlanVersion> optVer = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(plan.getPlanId());
            if (optVer.isEmpty()) continue;
            SubscriptionPlanVersion ver = optVer.get();

            VenueSubscriptionPlanDto dto = new VenueSubscriptionPlanDto();
            dto.setPlanId(plan.getPlanId());
            dto.setPlanUuid(plan.getPlanUuid());
            dto.setPlanCode(plan.getPlanCode());
            dto.setName(plan.getName());
            dto.setDescription(plan.getDescription());
            dto.setDisplayOrder(plan.getDisplayOrder());
            dto.setVersionId(ver.getVersionId());
            dto.setVersionNumber(ver.getVersionNumber());
            dto.setMarketplaceCommissionRate(ver.getMarketplaceCommissionRate());

            List<SubscriptionPlanPrice> prices = priceRepository.findByVersionId(ver.getVersionId());
            for (SubscriptionPlanPrice p : prices) {
                if ("MONTHLY".equalsIgnoreCase(p.getBillingCycle())) dto.setMonthlyPrice(p.getAmount());
                if ("YEARLY".equalsIgnoreCase(p.getBillingCycle())) dto.setYearlyPrice(p.getAmount());
            }

            Map<String, Integer> limits = new HashMap<>();
            for (SubscriptionPlanLimit lim : limitRepository.findByVersionId(ver.getVersionId())) {
                limits.put(lim.getLimitCode(), lim.getLimitValue());
            }
            dto.setLimits(limits);

            Map<String, Boolean> feats = new HashMap<>();
            for (SubscriptionPlanFeature f : featureRepository.findByVersionId(ver.getVersionId())) {
                feats.put(f.getFeatureCode(), f.getIsEnabled());
            }
            dto.setFeatures(feats);

            dtos.add(dto);
        }

        return dtos;
    }

    @Transactional
    public VenueEntitlementSummaryDto getVenueEntitlements(UUID organizationUuid) {
        Organization organization = organizationRepository.findByOrganizationUuid(organizationUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + organizationUuid));

        // Find active subscription
        Optional<OrganizationSubscription> optSub = orgSubRepository.findByOrganizationIdAndStatus(organization.getOrganizationId(), "ACTIVE");
        OrganizationSubscription sub;

        if (optSub.isEmpty()) {
            // Auto-assign Free plan for new organizations
            sub = assignDefaultSubscription(organization);
        } else {
            sub = optSub.get();
            // If the subscription was automatically grandfathered to PRO without an actual payment, or if a paid plan has expired, reset to default free tier
            if ("LEGACY_GRANDFATHERED".equals(sub.getPaymentReference())
                    || (sub.getEndDate() != null && sub.getEndDate().isBefore(LocalDateTime.now()))) {
                sub.setStatus("EXPIRED");
                orgSubRepository.save(sub);
                sub = assignDefaultSubscription(organization);
            }
        }

        // Resolve version
        SubscriptionPlanVersion version = resolveSubscriptionVersion(sub);
        SubscriptionPlan plan = planRepository.findById(version.getPlanId())
                .orElseThrow(() -> new IllegalStateException("Plan not found for version: " + version.getVersionId()));

        VenueEntitlementSummaryDto summary = new VenueEntitlementSummaryDto();
        summary.setPlanCode(plan.getPlanCode());
        summary.setPlanName(plan.getName());
        summary.setBillingCycle(sub.getBillingCycle() != null ? sub.getBillingCycle() : "MONTHLY");
        summary.setStatus(sub.getStatus());
        summary.setStartDate(sub.getStartDate());
        summary.setEndDate(sub.getEndDate());
        summary.setMarketplaceCommissionRate(version.getMarketplaceCommissionRate());

        LocalDateTime now = LocalDateTime.now();
        boolean isExpired = sub.getEndDate() != null && sub.getEndDate().isBefore(now);
        summary.setExpired(isExpired);
        summary.setDaysRemaining(sub.getEndDate() != null ? ChronoUnit.DAYS.between(now, sub.getEndDate()) : 0L);

        // Limits + active add-ons
        Map<String, Integer> limits = new HashMap<>();
        for (SubscriptionPlanLimit lim : limitRepository.findByVersionId(version.getVersionId())) {
            limits.put(lim.getLimitCode(), lim.getLimitValue());
        }

        List<OrganizationSubscriptionAddon> addons = addonRepository.findBySubscriptionIdAndStatus(sub.getOrganizationSubscriptionId(), "ACTIVE");
        for (OrganizationSubscriptionAddon addon : addons) {
            String targetLimitKey = "MAX_" + addon.getAddonType().toUpperCase() + "S";
            limits.put(targetLimitKey, limits.getOrDefault(targetLimitKey, 0) + addon.getQuantity());
        }
        summary.setLimits(limits);

        // Actual Resource Usage
        Map<String, Integer> usage = new HashMap<>();
        List<Venue> venues = venueRepository.findByOrganizationUuid(organizationUuid);
        usage.put("VENUES_USED", venues.size());

        List<Long> venueIds = venues.stream().map(Venue::getVenueId).collect(Collectors.toList());
        long facilitiesCount = venueIds.isEmpty() ? 0 : facilityRepository.countByVenueIdIn(venueIds);
        usage.put("FACILITIES_USED", (int) facilitiesCount);

        int staffCount = staffRepository.findByOrganizationUuidAndIsActiveOrderByCreatedAtDesc(organizationUuid, 1).size();
        usage.put("STAFF_USED", staffCount);
        summary.setUsage(usage);

        // Feature flags
        Map<String, Boolean> features = new HashMap<>();
        for (SubscriptionPlanFeature f : featureRepository.findByVersionId(version.getVersionId())) {
            features.put(f.getFeatureCode(), f.getIsEnabled());
        }
        summary.setFeatures(features);

        // Quota headroom indicators
        summary.setCanAddFacility((int) facilitiesCount < limits.getOrDefault("MAX_FACILITIES", 1));
        summary.setCanAddStaff(staffCount < limits.getOrDefault("MAX_STAFF", 1));
        summary.setCanAddVenue(venues.size() < limits.getOrDefault("MAX_VENUES", 1));

        return summary;
    }

    private SubscriptionPlan findDefaultVenuePlan() {
        List<SubscriptionPlan> venuePlans = planRepository.findByTargetModuleOrderByDisplayOrderAsc("VENUE");
        if (venuePlans.isEmpty()) {
            venuePlans = planRepository.findAll();
        }
        if (venuePlans.isEmpty()) {
            throw new IllegalStateException("No subscription plans found in database");
        }
        return venuePlans.stream()
                .filter(p -> p.getDisplayOrder() == 0 || (p.getPlanCode() != null && p.getPlanCode().toUpperCase().contains("FREE")))
                .findFirst()
                .orElse(venuePlans.get(0));
    }

    private OrganizationSubscription assignDefaultSubscription(Organization organization) {
        SubscriptionPlan plan = findDefaultVenuePlan();
        SubscriptionPlanVersion version = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(plan.getPlanId())
                .orElseThrow(() -> new IllegalStateException("No published version for plan: " + plan.getName()));

        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusYears(10); // Perpetual for base free tier

        OrganizationSubscription sub = new OrganizationSubscription(
                organization.getOrganizationId(),
                plan.getPlanId(),
                start,
                end,
                "FREE_TIER_INIT"
        );
        sub.setVersionId(version.getVersionId());
        sub.setBillingCycle("MONTHLY");
        sub.setStatus("ACTIVE");

        return orgSubRepository.save(sub);
    }

    private SubscriptionPlanVersion resolveSubscriptionVersion(OrganizationSubscription sub) {
        if (sub.getVersionId() != null) {
            Optional<SubscriptionPlanVersion> opt = versionRepository.findById(sub.getVersionId());
            if (opt.isPresent()) return opt.get();
        }

        // Fallback to latest published version of the package/plan
        if (sub.getPackageId() != null) {
            Optional<SubscriptionPlanVersion> opt = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(sub.getPackageId());
            if (opt.isPresent()) return opt.get();
        }

        // Dynamic fallback to the default base tier plan
        SubscriptionPlan defaultPlan = findDefaultVenuePlan();
        return versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(defaultPlan.getPlanId())
                .orElseThrow(() -> new IllegalStateException("No published version available for plan: " + defaultPlan.getName()));
    }

    @Transactional
    public VenueEntitlementSummaryDto subscribeVenuePlan(UUID organizationUuid, String planCodeOrUuid, String billingCycle, String paymentReference) {
        Organization organization = organizationRepository.findByOrganizationUuid(organizationUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + organizationUuid));

        SubscriptionPlan plan = null;
        if (planCodeOrUuid != null && !planCodeOrUuid.trim().isEmpty()) {
            try {
                UUID planUuid = UUID.fromString(planCodeOrUuid.trim());
                plan = planRepository.findByPlanUuid(planUuid).orElse(null);
            } catch (IllegalArgumentException ignored) {}

            if (plan == null) {
                plan = planRepository.findByPlanCode(planCodeOrUuid.trim()).orElse(null);
            }
        }

        if (plan == null) {
            plan = findDefaultVenuePlan();
        }

        final SubscriptionPlan targetPlan = plan;
        SubscriptionPlanVersion version = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(targetPlan.getPlanId())
                .orElseThrow(() -> new IllegalStateException("No published version for plan: " + targetPlan.getName()));

        // Mark previous active subscriptions as EXPIRED in organization_subscriptions table
        List<OrganizationSubscription> activeSubs = orgSubRepository.findByOrganizationId(organization.getOrganizationId());
        for (OrganizationSubscription s : activeSubs) {
            if ("ACTIVE".equalsIgnoreCase(s.getStatus())) {
                s.setStatus("EXPIRED");
                orgSubRepository.save(s);
            }
        }

        LocalDateTime start = LocalDateTime.now();
        String cycle = (billingCycle != null && "YEARLY".equalsIgnoreCase(billingCycle)) ? "YEARLY" : "MONTHLY";

        List<SubscriptionPlanPrice> prices = priceRepository.findByVersionId(version.getVersionId());
        BigDecimal planPrice = BigDecimal.ZERO;
        for (SubscriptionPlanPrice p : prices) {
            if (cycle.equalsIgnoreCase(p.getBillingCycle())) {
                planPrice = p.getAmount();
            }
        }

        LocalDateTime end;
        if (planPrice.compareTo(BigDecimal.ZERO) == 0 || (plan.getPlanCode() != null && plan.getPlanCode().toUpperCase().contains("FREE"))) {
            end = start.plusYears(10);
        } else if ("YEARLY".equalsIgnoreCase(cycle)) {
            end = start.plusYears(1);
        } else {
            end = start.plusMonths(1);
        }

        OrganizationSubscription newSub = new OrganizationSubscription(
                organization.getOrganizationId(),
                plan.getPlanId(),
                start,
                end,
                paymentReference != null ? paymentReference : "PLAN_ACTIVATION"
        );
        newSub.setVersionId(version.getVersionId());
        newSub.setBillingCycle(cycle);
        newSub.setStatus("ACTIVE");
        orgSubRepository.save(newSub);

        return getVenueEntitlements(organizationUuid);
    }

    @Transactional(readOnly = true)
    public void assertFeature(UUID organizationUuid, VenueFeatureCode feature) {
        if (organizationUuid == null) return;
        VenueEntitlementSummaryDto summary = getVenueEntitlements(organizationUuid);
        Boolean isEnabled = summary.getFeatures().getOrDefault(feature.name(), false);

        if (!Boolean.TRUE.equals(isEnabled)) {
            VenueSubscriptionPlanDto recommended = resolveRecommendedPlanForFeature(feature.name());
            String recCode = recommended != null ? recommended.getPlanCode() : "VENUE_PRO";
            String recName = recommended != null ? recommended.getName() : "Venue Professional";
            throw new SubscriptionEntitlementException(
                    "Feature '" + feature.name() + "' is not included in your current " + summary.getPlanName() + " plan. Upgrade to " + recName + " to unlock.",
                    recCode,
                    feature.name()
            );
        }
    }

    @Transactional(readOnly = true)
    public void assertQuota(UUID organizationUuid, String limitCode, int increment) {
        if (organizationUuid == null) return;
        VenueEntitlementSummaryDto summary = getVenueEntitlements(organizationUuid);

        int maxLimit = summary.getLimits().getOrDefault(limitCode, 1);
        int currentUsage = 0;

        if ("MAX_FACILITIES".equals(limitCode)) {
            currentUsage = summary.getUsage().getOrDefault("FACILITIES_USED", 0);
        } else if ("MAX_STAFF".equals(limitCode)) {
            currentUsage = summary.getUsage().getOrDefault("STAFF_USED", 0);
        } else if ("MAX_VENUES".equals(limitCode)) {
            currentUsage = summary.getUsage().getOrDefault("VENUES_USED", 0);
        }

        if (currentUsage + increment > maxLimit) {
            VenueSubscriptionPlanDto recommended = resolveRecommendedPlanForLimit(limitCode, currentUsage + increment);
            String recCode = recommended != null ? recommended.getPlanCode() : "VENUE_PRO";
            String recName = recommended != null ? recommended.getName() : "Venue Professional";
            throw new SubscriptionEntitlementException(
                    "Quota limit reached for " + limitCode + ". Current usage: " + currentUsage + ", Limit: " + maxLimit + ". Upgrade to " + recName + " or add capacity.",
                    recCode,
                    limitCode
            );
        }
    }

    private VenueSubscriptionPlanDto resolveRecommendedPlanForFeature(String featureCode) {
        List<VenueSubscriptionPlanDto> plans = getAllVenuePlans();
        for (VenueSubscriptionPlanDto p : plans) {
            if (p.getFeatures() != null && Boolean.TRUE.equals(p.getFeatures().get(featureCode))) {
                return p;
            }
        }
        return plans.isEmpty() ? null : plans.get(plans.size() - 1);
    }

    private VenueSubscriptionPlanDto resolveRecommendedPlanForLimit(String limitCode, int neededValue) {
        List<VenueSubscriptionPlanDto> plans = getAllVenuePlans();
        for (VenueSubscriptionPlanDto p : plans) {
            if (p.getLimits() != null && p.getLimits().getOrDefault(limitCode, 0) >= neededValue) {
                return p;
            }
        }
        return plans.isEmpty() ? null : plans.get(plans.size() - 1);
    }

    @Transactional
    public Map<String, Object> createSubscriptionPlan(SaveSubscriptionPlanRequest request) {
        String module = request.getTargetModule() != null ? request.getTargetModule().toUpperCase().trim() : "VENUE";
        String rawName = request.getName() != null ? request.getName().trim() : "New Plan";

        String planCode = request.getPlanCode();
        if (planCode == null || planCode.trim().isEmpty()) {
            String sanitized = rawName.toUpperCase().replaceAll("[^A-Z0-9]+", "_");
            planCode = module + "_" + sanitized;
            if (planRepository.findByPlanCode(planCode).isPresent()) {
                planCode = planCode + "_" + (System.currentTimeMillis() % 10000);
            }
        } else {
            planCode = planCode.trim().toUpperCase();
        }

        int displayOrder = request.getDisplayOrder() != null ? request.getDisplayOrder() : 0;
        SubscriptionPlan plan = new SubscriptionPlan(
                planCode,
                rawName,
                request.getDescription(),
                module,
                displayOrder
        );
        plan.setIsActive(request.getIsActive() != null ? request.getIsActive() : 1);
        plan = planRepository.save(plan);

        BigDecimal commission = request.getMarketplaceCommissionRate() != null
                ? request.getMarketplaceCommissionRate()
                : BigDecimal.ZERO;

        SubscriptionPlanVersion version = new SubscriptionPlanVersion(plan.getPlanId(), 1, commission, true);
        version = versionRepository.save(version);

        // Prices
        if (request.getMonthlyPrice() != null) {
            priceRepository.save(new SubscriptionPlanPrice(version.getVersionId(), "MONTHLY", request.getMonthlyPrice(), "INR"));
        }
        if (request.getYearlyPrice() != null) {
            priceRepository.save(new SubscriptionPlanPrice(version.getVersionId(), "YEARLY", request.getYearlyPrice(), "INR"));
        }
        if (request.getPackagePrice() != null) {
            priceRepository.save(new SubscriptionPlanPrice(version.getVersionId(), "PACKAGE", request.getPackagePrice(), "INR"));
        }

        // Limits
        if (request.getLimits() != null) {
            for (Map.Entry<String, Integer> entry : request.getLimits().entrySet()) {
                if (entry.getKey() != null && entry.getValue() != null) {
                    limitRepository.save(new SubscriptionPlanLimit(version.getVersionId(), entry.getKey(), entry.getValue()));
                }
            }
        }

        // Features
        if (request.getFeatures() != null) {
            for (Map.Entry<String, Boolean> entry : request.getFeatures().entrySet()) {
                if (entry.getKey() != null && entry.getValue() != null) {
                    featureRepository.save(new SubscriptionPlanFeature(version.getVersionId(), entry.getKey(), entry.getValue()));
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("planId", plan.getPlanId());
        result.put("planUuid", plan.getPlanUuid());
        result.put("planCode", plan.getPlanCode());
        result.put("name", plan.getName());
        result.put("targetModule", plan.getTargetModule());
        return result;
    }

    @Transactional
    public Map<String, Object> updateSubscriptionPlan(SaveSubscriptionPlanRequest request) {
        SubscriptionPlan plan = null;
        if (request.getPlanUuid() != null) {
            plan = planRepository.findByPlanUuid(request.getPlanUuid()).orElse(null);
        }
        if (plan == null && request.getPlanCode() != null) {
            plan = planRepository.findByPlanCode(request.getPlanCode()).orElse(null);
        }
        if (plan == null && request.getPlanId() != null) {
            plan = planRepository.findById(request.getPlanId()).orElse(null);
        }
        if (plan == null) {
            throw new ResourceNotFoundException("Subscription plan not found to update.");
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            plan.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            plan.setDescription(request.getDescription().trim());
        }
        if (request.getDisplayOrder() != null) {
            plan.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIsActive() != null) {
            plan.setIsActive(request.getIsActive());
        }
        if (request.getTargetModule() != null && !request.getTargetModule().trim().isEmpty()) {
            plan.setTargetModule(request.getTargetModule().toUpperCase().trim());
        }
        plan = planRepository.save(plan);

        // Get latest version or create
        final Long currentPlanId = plan.getPlanId();
        SubscriptionPlanVersion version = versionRepository
                .findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(currentPlanId)
                .orElseGet(() -> versionRepository.save(new SubscriptionPlanVersion(currentPlanId, 1, BigDecimal.ZERO, true)));

        if (request.getMarketplaceCommissionRate() != null) {
            version.setMarketplaceCommissionRate(request.getMarketplaceCommissionRate());
            version = versionRepository.save(version);
        }

        // Prices: Update or Insert
        if (request.getMonthlyPrice() != null) {
            Optional<SubscriptionPlanPrice> opt = priceRepository.findByVersionIdAndBillingCycle(version.getVersionId(), "MONTHLY");
            if (opt.isPresent()) {
                SubscriptionPlanPrice p = opt.get();
                p.setAmount(request.getMonthlyPrice());
                priceRepository.save(p);
            } else {
                priceRepository.save(new SubscriptionPlanPrice(version.getVersionId(), "MONTHLY", request.getMonthlyPrice(), "INR"));
            }
        }
        if (request.getYearlyPrice() != null) {
            Optional<SubscriptionPlanPrice> opt = priceRepository.findByVersionIdAndBillingCycle(version.getVersionId(), "YEARLY");
            if (opt.isPresent()) {
                SubscriptionPlanPrice p = opt.get();
                p.setAmount(request.getYearlyPrice());
                priceRepository.save(p);
            } else {
                priceRepository.save(new SubscriptionPlanPrice(version.getVersionId(), "YEARLY", request.getYearlyPrice(), "INR"));
            }
        }
        if (request.getPackagePrice() != null) {
            Optional<SubscriptionPlanPrice> opt = priceRepository.findByVersionIdAndBillingCycle(version.getVersionId(), "PACKAGE");
            if (opt.isPresent()) {
                SubscriptionPlanPrice p = opt.get();
                p.setAmount(request.getPackagePrice());
                priceRepository.save(p);
            } else {
                priceRepository.save(new SubscriptionPlanPrice(version.getVersionId(), "PACKAGE", request.getPackagePrice(), "INR"));
            }
        }

        // Limits: Update or Insert
        if (request.getLimits() != null) {
            for (Map.Entry<String, Integer> entry : request.getLimits().entrySet()) {
                if (entry.getKey() != null && entry.getValue() != null) {
                    Optional<SubscriptionPlanLimit> optLim = limitRepository.findByVersionIdAndLimitCode(version.getVersionId(), entry.getKey());
                    if (optLim.isPresent()) {
                        SubscriptionPlanLimit l = optLim.get();
                        l.setLimitValue(entry.getValue());
                        limitRepository.save(l);
                    } else {
                        limitRepository.save(new SubscriptionPlanLimit(version.getVersionId(), entry.getKey(), entry.getValue()));
                    }
                }
            }
        }

        // Features: Update or Insert
        if (request.getFeatures() != null) {
            for (Map.Entry<String, Boolean> entry : request.getFeatures().entrySet()) {
                if (entry.getKey() != null && entry.getValue() != null) {
                    Optional<SubscriptionPlanFeature> optFeat = featureRepository.findByVersionIdAndFeatureCode(version.getVersionId(), entry.getKey());
                    if (optFeat.isPresent()) {
                        SubscriptionPlanFeature f = optFeat.get();
                        f.setIsEnabled(entry.getValue());
                        featureRepository.save(f);
                    } else {
                        featureRepository.save(new SubscriptionPlanFeature(version.getVersionId(), entry.getKey(), entry.getValue()));
                    }
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("planId", plan.getPlanId());
        result.put("planUuid", plan.getPlanUuid());
        result.put("planCode", plan.getPlanCode());
        result.put("name", plan.getName());
        result.put("targetModule", plan.getTargetModule());
        return result;
    }

    @Transactional
    public Map<String, Object> togglePlanStatus(UUID planUuid) {
        SubscriptionPlan plan = planRepository.findByPlanUuid(planUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with UUID: " + planUuid));

        int newStatus = (plan.getIsActive() != null && plan.getIsActive() == 1) ? 0 : 1;
        plan.setIsActive(newStatus);
        plan = planRepository.save(plan);

        Map<String, Object> result = new HashMap<>();
        result.put("planUuid", plan.getPlanUuid());
        result.put("planCode", plan.getPlanCode());
        result.put("isActive", plan.getIsActive());
        return result;
    }
}

