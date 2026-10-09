package com.athlon.identityservice.admin.service;

import com.athlon.identityservice.admin.entity.PlatformSubscriptionRequest;
import com.athlon.identityservice.admin.repository.PlatformSubscriptionRequestRepository;
import com.athlon.identityservice.exception.BadRequestException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.oganizationsubscription.entity.OrganizationSubscription;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.organizationsubscription.repository.OrganizationSubscriptionRepository;
import com.athlon.identityservice.subscription.entity.SubscriptionPackage;
import com.athlon.identityservice.subscription.repository.SubscriptionPackageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AdminSubscriptionRequestService {

    private final PlatformSubscriptionRequestRepository requestRepository;
    private final OrganizationRepository organizationRepository;
    private final SubscriptionPackageRepository packageRepository;
    private final OrganizationSubscriptionRepository subscriptionRepository;
    private final AdminAuditService adminAuditService;

    public AdminSubscriptionRequestService(PlatformSubscriptionRequestRepository requestRepository,
                                           OrganizationRepository organizationRepository,
                                           SubscriptionPackageRepository packageRepository,
                                           OrganizationSubscriptionRepository subscriptionRepository,
                                           AdminAuditService adminAuditService) {
        this.requestRepository = requestRepository;
        this.organizationRepository = organizationRepository;
        this.packageRepository = packageRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.adminAuditService = adminAuditService;
    }

    @Transactional(readOnly = true)
    public Page<PlatformSubscriptionRequest> getRequests(String status, Pageable pageable) {
        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            return requestRepository.findByRequestStatusOrderByCreatedAtDesc(status.trim().toUpperCase(), pageable);
        }
        return requestRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional
    public PlatformSubscriptionRequest approveRequest(UUID requestUuid,
                                                      Long adminUserId,
                                                      UUID adminUserUuid,
                                                      String adminEmail,
                                                      String requestIp) {
        PlatformSubscriptionRequest req = requestRepository.findByRequestUuid(requestUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription request not found: " + requestUuid));

        if (!"PENDING".equalsIgnoreCase(req.getRequestStatus()) && !"UNDER_REVIEW".equalsIgnoreCase(req.getRequestStatus())) {
            throw new BadRequestException("Request cannot be approved in status: " + req.getRequestStatus());
        }

        // Expire any existing active subscription for this organization
        subscriptionRepository.findByOrganizationIdAndStatus(req.getOrganizationId(), "ACTIVE")
                .ifPresent(existingSub -> {
                    existingSub.setStatus("EXPIRED");
                    subscriptionRepository.save(existingSub);
                });

        int months = req.getBillingPeriodMonths() != null && req.getBillingPeriodMonths() > 0 ? req.getBillingPeriodMonths() : 1;
        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = startDate.plusMonths(months);

        OrganizationSubscription subscription = new OrganizationSubscription(
                req.getOrganizationId(),
                req.getPackageId(),
                startDate,
                endDate,
                req.getPaymentReference() != null ? req.getPaymentReference() : "MANUAL_VERIFIED_" + req.getRequestUuid().toString().substring(0, 8)
        );
        subscription.setStatus("ACTIVE");
        subscription = subscriptionRepository.save(subscription);

        req.setRequestStatus("APPROVED");
        req.setPaymentStatus("VERIFIED");
        req.setReviewedByAdminId(adminUserId);
        req.setReviewedAt(LocalDateTime.now());
        req.setActivatedSubscriptionId(subscription.getOrganizationSubscriptionId());
        req = requestRepository.save(req);

        // Record audit
        adminAuditService.record(
                adminUserId,
                adminUserUuid,
                adminEmail,
                "SUBSCRIPTION_REQUEST_APPROVED",
                "SUBSCRIPTION_REQUEST",
                req.getRequestUuid().toString(),
                "{\"status\":\"PENDING\"}",
                "{\"status\":\"APPROVED\",\"subscriptionId\":" + subscription.getOrganizationSubscriptionId() + "}",
                "Manual payment verified and subscription activated",
                requestIp
        );

        return req;
    }

    @Transactional
    public PlatformSubscriptionRequest rejectRequest(UUID requestUuid,
                                                     String reason,
                                                     Long adminUserId,
                                                     UUID adminUserUuid,
                                                     String adminEmail,
                                                     String requestIp) {
        PlatformSubscriptionRequest req = requestRepository.findByRequestUuid(requestUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription request not found: " + requestUuid));

        if (!"PENDING".equalsIgnoreCase(req.getRequestStatus()) && !"UNDER_REVIEW".equalsIgnoreCase(req.getRequestStatus())) {
            throw new BadRequestException("Request cannot be rejected in status: " + req.getRequestStatus());
        }

        req.setRequestStatus("REJECTED");
        req.setRejectionReason(reason);
        req.setReviewedByAdminId(adminUserId);
        req.setReviewedAt(LocalDateTime.now());
        req = requestRepository.save(req);

        adminAuditService.record(
                adminUserId,
                adminUserUuid,
                adminEmail,
                "SUBSCRIPTION_REQUEST_REJECTED",
                "SUBSCRIPTION_REQUEST",
                req.getRequestUuid().toString(),
                "{\"status\":\"PENDING\"}",
                "{\"status\":\"REJECTED\"}",
                reason,
                requestIp
        );

        return req;
    }
}
