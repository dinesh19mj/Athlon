package com.athlon.identityservice.admin.service;

import com.athlon.identityservice.admin.dto.AdminOrganizationResponse;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.oganizationsubscription.entity.OrganizationSubscription;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.organizationsubscription.repository.OrganizationSubscriptionRepository;
import com.athlon.identityservice.subscription.entity.SubscriptionPackage;
import com.athlon.identityservice.subscription.repository.SubscriptionPackageRepository;
import com.athlon.identityservice.user.entity.User;
import com.athlon.identityservice.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminOrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationSubscriptionRepository subscriptionRepository;
    private final SubscriptionPackageRepository packageRepository;
    private final UserRepository userRepository;
    private final AdminAuditService adminAuditService;

    public AdminOrganizationService(OrganizationRepository organizationRepository,
                                    OrganizationSubscriptionRepository subscriptionRepository,
                                    SubscriptionPackageRepository packageRepository,
                                    UserRepository userRepository,
                                    AdminAuditService adminAuditService) {
        this.organizationRepository = organizationRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.packageRepository = packageRepository;
        this.userRepository = userRepository;
        this.adminAuditService = adminAuditService;
    }

    @Transactional(readOnly = true)
    public Page<AdminOrganizationResponse> getOrganizations(String query, String type, Integer isActive, Pageable pageable) {
        Page<Organization> orgsPage;
        if (query != null && !query.trim().isEmpty()) {
            orgsPage = organizationRepository.searchByName(query.trim(), pageable);
        } else if (type != null && !type.trim().isEmpty()) {
            orgsPage = organizationRepository.findByType(type.trim().toUpperCase(), pageable);
        } else if (isActive != null) {
            orgsPage = organizationRepository.findByIsActive(isActive, pageable);
        } else {
            orgsPage = organizationRepository.findAll(pageable);
        }

        List<AdminOrganizationResponse> dtos = orgsPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, orgsPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public AdminOrganizationResponse getOrganizationDetail(UUID organizationUuid) {
        Organization org = organizationRepository.findByOrganizationUuid(organizationUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + organizationUuid));
        return mapToResponse(org);
    }

    @Transactional
    public AdminOrganizationResponse updateOrganizationStatus(UUID organizationUuid,
                                                              Integer newStatus,
                                                              String reason,
                                                              Long adminUserId,
                                                              UUID adminUserUuid,
                                                              String adminEmail,
                                                              String requestIp) {
        Organization org = organizationRepository.findByOrganizationUuid(organizationUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + organizationUuid));

        Integer previousStatus = org.getIsActive();
        org.setIsActive(newStatus);
        org = organizationRepository.save(org);

        String action = newStatus != null && newStatus == 1 ? "ORGANIZATION_ACTIVATED" : "ORGANIZATION_SUSPENDED";
        adminAuditService.record(
                adminUserId,
                adminUserUuid,
                adminEmail,
                action,
                "ORGANIZATION",
                org.getOrganizationUuid().toString(),
                "{\"isActive\":" + previousStatus + "}",
                "{\"isActive\":" + newStatus + "}",
                reason,
                requestIp
        );

        return mapToResponse(org);
    }

    private AdminOrganizationResponse mapToResponse(Organization org) {
        AdminOrganizationResponse resp = new AdminOrganizationResponse();
        resp.setOrganizationId(org.getOrganizationId());
        resp.setOrganizationUuid(org.getOrganizationUuid());
        resp.setName(org.getName());
        resp.setType(org.getType());
        resp.setDescription(org.getDescription());
        resp.setIsActive(org.getIsActive());
        resp.setCreatedAt(org.getCreatedAt());

        resp.setUserId(org.getUserId());
        resp.setUserUuid(org.getUserUuid());

        if (org.getUserUuid() != null) {
            userRepository.findByUserUuid(org.getUserUuid()).ifPresent(u -> resp.setOwnerEmail(u.getEmail()));
        } else if (org.getUserId() != null) {
            userRepository.findById(org.getUserId()).ifPresent(u -> resp.setOwnerEmail(u.getEmail()));
        }

        // Active subscription lookup
        Optional<OrganizationSubscription> subOpt = subscriptionRepository.findByOrganizationIdAndStatus(org.getOrganizationId(), "ACTIVE");
        if (subOpt.isPresent()) {
            OrganizationSubscription sub = subOpt.get();
            resp.setSubscriptionExpiry(sub.getEndDate());
            packageRepository.findById(sub.getPackageId()).ifPresent(p -> resp.setActivePackageName(p.getName()));
        }

        return resp;
    }
}
