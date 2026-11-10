package com.athlon.identityservice.subscription.service;

import com.athlon.identityservice.dto.request.SubscribeOrganizationRequest;
import com.athlon.identityservice.dto.response.OrganizationSubscriptionResponse;
import com.athlon.identityservice.subscription.dto.response.SubscriptionPackageResponse;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.oganizationsubscription.entity.OrganizationSubscription;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.organizationsubscription.repository.OrganizationSubscriptionRepository;
import com.athlon.identityservice.subscription.entity.SubscriptionPlan;
import com.athlon.identityservice.subscription.entity.SubscriptionPlanVersion;
import com.athlon.identityservice.subscription.repository.SubscriptionPlanRepository;
import com.athlon.identityservice.subscription.repository.SubscriptionPlanVersionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SubscriptionService {

    private final OrganizationSubscriptionRepository organizationSubscriptionRepository;
    private final OrganizationRepository organizationRepository;
    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionPlanVersionRepository versionRepository;
    private final TournamentEntitlementService tournamentEntitlementService;

    public SubscriptionService(
            OrganizationSubscriptionRepository organizationSubscriptionRepository,
            OrganizationRepository organizationRepository,
            SubscriptionPlanRepository planRepository,
            SubscriptionPlanVersionRepository versionRepository,
            TournamentEntitlementService tournamentEntitlementService) {
        this.organizationSubscriptionRepository = organizationSubscriptionRepository;
        this.organizationRepository = organizationRepository;
        this.planRepository = planRepository;
        this.versionRepository = versionRepository;
        this.tournamentEntitlementService = tournamentEntitlementService;
    }

    @Transactional
    public OrganizationSubscriptionResponse subscribeOrganization(SubscribeOrganizationRequest request) {
        Organization organization = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + request.getOrganizationUuid()));

        // Resolve SubscriptionPlan dynamically from subscription_plans table
        SubscriptionPlan resolvedPlan = null;
        if (request.getPackageUuid() != null) {
            resolvedPlan = planRepository.findByPlanUuid(request.getPackageUuid()).orElse(null);
        }

        if (resolvedPlan == null) {
            // Dynamic fallback: lowest display order or free plan for module
            String targetModule = ("ORGANIZER".equalsIgnoreCase(organization.getType())
                    || "TOURNAMENT".equalsIgnoreCase(organization.getType())) ? "TOURNAMENT" : "VENUE";
            List<SubscriptionPlan> defaultPlans = planRepository.findByTargetModuleOrderByDisplayOrderAsc(targetModule);
            if (!defaultPlans.isEmpty()) {
                resolvedPlan = defaultPlans.get(0);
            } else {
                resolvedPlan = planRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No subscription plan found in database"));
            }
        }

        final SubscriptionPlan plan = resolvedPlan;
        SubscriptionPlanVersion version = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(plan.getPlanId())
                .orElseThrow(() -> new IllegalStateException("No published version found for plan: " + plan.getName()));

        // Expire previous active subscriptions in organization_subscriptions
        List<OrganizationSubscription> existingSubs = organizationSubscriptionRepository.findByOrganizationId(organization.getOrganizationId());
        for (OrganizationSubscription s : existingSubs) {
            if ("ACTIVE".equalsIgnoreCase(s.getStatus())) {
                s.setStatus("EXPIRED");
                organizationSubscriptionRepository.save(s);
            }
        }

        LocalDateTime startDate = LocalDateTime.now();
        boolean isFree = plan.getPlanCode() != null && plan.getPlanCode().toUpperCase().contains("FREE");
        LocalDateTime endDate = isFree ? startDate.plusYears(10) : startDate.plusMonths(1);

        OrganizationSubscription subscription = new OrganizationSubscription(
                organization.getOrganizationId(),
                plan.getPlanId(),
                startDate,
                endDate,
                request.getPaymentReference() != null ? request.getPaymentReference() : "PLAN_SUBSCRIPTION"
        );
        subscription.setVersionId(version.getVersionId());
        subscription.setBillingCycle("MONTHLY");
        subscription.setStatus("ACTIVE");

        subscription = organizationSubscriptionRepository.save(subscription);

        if ("TOURNAMENT".equalsIgnoreCase(plan.getTargetModule())
                || "ORGANIZER".equalsIgnoreCase(plan.getTargetModule())
                || "ORGANIZER".equalsIgnoreCase(organization.getType())
                || "TOURNAMENT".equalsIgnoreCase(organization.getType())) {
            tournamentEntitlementService.syncCreditAccountWithPlan(
                    organization.getOrganizationId(),
                    plan,
                    version,
                    subscription.getPaymentReference()
            );
        }

        OrganizationSubscriptionResponse response = new OrganizationSubscriptionResponse();
        response.setUuid(subscription.getOrganizationSubscriptionUuid());
        response.setOrganizationId(subscription.getOrganizationId());
        response.setStartDate(subscription.getStartDate());
        response.setEndDate(subscription.getEndDate());
        response.setStatus(subscription.getStatus());
        response.setPaymentReference(subscription.getPaymentReference());

        SubscriptionPackageResponse pkgResp = new SubscriptionPackageResponse();
        pkgResp.setUuid(plan.getPlanUuid());
        pkgResp.setName(plan.getName());
        pkgResp.setDescription(plan.getDescription());
        response.setSubscriptionPackage(pkgResp);

        return response;
    }

    @Transactional
    public OrganizationSubscriptionResponse getActiveSubscription(UUID organizationUuid) {
        Organization organization = organizationRepository.findByOrganizationUuid(organizationUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + organizationUuid));

        OrganizationSubscription subscription = organizationSubscriptionRepository.findByOrganizationIdAndStatus(organization.getOrganizationId(), "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("No active subscription found for Organization UUID: " + organizationUuid));

        if (subscription.getEndDate() != null && subscription.getEndDate().isBefore(java.time.LocalDateTime.now())) {
            subscription.setStatus("EXPIRED");
            organizationSubscriptionRepository.save(subscription);
            throw new ResourceNotFoundException("Active subscription has expired for Organization UUID: " + organizationUuid);
        }

        SubscriptionPlan plan = planRepository.findById(subscription.getPackageId()).orElse(null);

        OrganizationSubscriptionResponse response = new OrganizationSubscriptionResponse();
        response.setUuid(subscription.getOrganizationSubscriptionUuid());
        response.setOrganizationId(subscription.getOrganizationId());
        response.setStartDate(subscription.getStartDate());
        response.setEndDate(subscription.getEndDate());
        response.setStatus(subscription.getStatus());
        response.setPaymentReference(subscription.getPaymentReference());

        if (plan != null) {
            SubscriptionPackageResponse pkgResp = new SubscriptionPackageResponse();
            pkgResp.setUuid(plan.getPlanUuid());
            pkgResp.setName(plan.getName());
            pkgResp.setDescription(plan.getDescription());
            response.setSubscriptionPackage(pkgResp);
        }

        return response;
    }
}
