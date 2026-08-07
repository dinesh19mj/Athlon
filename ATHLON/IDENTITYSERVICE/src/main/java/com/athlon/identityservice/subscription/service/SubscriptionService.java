package com.athlon.identityservice.subscription.service;

import com.athlon.identityservice.subscription.dto.request.CreateSubscriptionPackageRequest;
import com.athlon.identityservice.dto.request.SubscribeOrganizationRequest;
import com.athlon.identityservice.dto.response.OrganizationSubscriptionResponse;
import com.athlon.identityservice.subscription.dto.response.SubscriptionPackageResponse;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.subscription.entity.SubscriptionPackage;
import com.athlon.identityservice.exception.DuplicateResourceException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.oganizationsubscription.entity.OrganizationSubscription;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.organizationsubscription.repository.OrganizationSubscriptionRepository;
import com.athlon.identityservice.subscription.repository.SubscriptionPackageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {

    private final SubscriptionPackageRepository subscriptionPackageRepository;
    private final OrganizationSubscriptionRepository organizationSubscriptionRepository;
    private final OrganizationRepository organizationRepository;

    public SubscriptionService(
            SubscriptionPackageRepository subscriptionPackageRepository,
            OrganizationSubscriptionRepository organizationSubscriptionRepository,
            OrganizationRepository organizationRepository) {
        this.subscriptionPackageRepository = subscriptionPackageRepository;
        this.organizationSubscriptionRepository = organizationSubscriptionRepository;
        this.organizationRepository = organizationRepository;
    }

    @Transactional
    public SubscriptionPackageResponse createPackage(CreateSubscriptionPackageRequest request) {
        if (subscriptionPackageRepository.findByName(request.getName()).isPresent()) {
            throw new DuplicateResourceException("Subscription Package already exists with name: " + request.getName());
        }

        SubscriptionPackage pack = new SubscriptionPackage(
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getDurationMonths(),
                request.getFeatures()
        );

        pack = subscriptionPackageRepository.save(pack);
        return mapToResponse(pack);
    }

    @Transactional(readOnly = true)
    public List<SubscriptionPackageResponse> getAllPackages() {
        return subscriptionPackageRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubscriptionPackageResponse getPackageByUuid(UUID uuid) {
        SubscriptionPackage pack = subscriptionPackageRepository.findByPackageUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription Package not found with UUID: " + uuid));
        return mapToResponse(pack);
    }

    @Transactional
    public OrganizationSubscriptionResponse subscribeOrganization(SubscribeOrganizationRequest request) {
        Organization organization = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + request.getOrganizationUuid()));

        SubscriptionPackage pack = subscriptionPackageRepository.findByPackageUuid(request.getPackageUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription Package not found with UUID: " + request.getPackageUuid()));

        // Check if organization already has an active subscription
        organizationSubscriptionRepository.findByOrganizationIdAndStatus(organization.getOrganizationId(), "ACTIVE")
                .ifPresent(sub -> {
                    // We could either expire the old one or throw an exception. Let's expire the old one for now.
                    sub.setStatus("EXPIRED");
                    organizationSubscriptionRepository.save(sub);
                });

        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = startDate.plusMonths(pack.getDurationMonths());

        OrganizationSubscription subscription = new OrganizationSubscription(
                organization.getOrganizationId(),
                pack.getPackageId(),
                startDate,
                endDate,
                request.getPaymentReference()
        );

        subscription = organizationSubscriptionRepository.save(subscription);

        return mapToResponse(subscription, pack);
    }

    @Transactional(readOnly = true)
    public OrganizationSubscriptionResponse getActiveSubscription(UUID organizationUuid) {
        Organization organization = organizationRepository.findByOrganizationUuid(organizationUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + organizationUuid));

        OrganizationSubscription subscription = organizationSubscriptionRepository.findByOrganizationIdAndStatus(organization.getOrganizationId(), "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("No active subscription found for Organization UUID: " + organizationUuid));

        SubscriptionPackage pack = subscriptionPackageRepository.findById(subscription.getPackageId())
                .orElseThrow(() -> new ResourceNotFoundException("Associated Subscription Package not found"));

        return mapToResponse(subscription, pack);
    }

    private SubscriptionPackageResponse mapToResponse(SubscriptionPackage pack) {
        SubscriptionPackageResponse response = new SubscriptionPackageResponse();
        response.setUuid(pack.getPackageUuid());
        response.setName(pack.getName());
        response.setDescription(pack.getDescription());
        response.setPrice(pack.getPrice());
        response.setDurationMonths(pack.getDurationMonths());
        response.setFeatures(pack.getFeatures());
        response.setIsActive(pack.getIsActive());
        return response;
    }

    private OrganizationSubscriptionResponse mapToResponse(OrganizationSubscription subscription, SubscriptionPackage pack) {
        OrganizationSubscriptionResponse response = new OrganizationSubscriptionResponse();
        response.setUuid(subscription.getOrganizationSubscriptionUuid());
        response.setOrganizationId(subscription.getOrganizationId());
        response.setStartDate(subscription.getStartDate());
        response.setEndDate(subscription.getEndDate());
        response.setStatus(subscription.getStatus());
        response.setPaymentReference(subscription.getPaymentReference());
        
        if (pack != null) {
            response.setSubscriptionPackage(mapToResponse(pack));
        }

        return response;
    }
}
