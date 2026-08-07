package com.athlon.identityservice.organization.service;

import com.athlon.identityservice.organization.dto.request.CreateOrganizationRequest;
import com.athlon.identityservice.organization.dto.request.UpdateOrganizationRequest;
import com.athlon.identityservice.organization.dto.response.OrganizationResponse;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.exception.DuplicateResourceException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.subscription.service.SubscriptionService;
import com.athlon.identityservice.dto.request.SubscribeOrganizationRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final SubscriptionService subscriptionService;

    public OrganizationService(OrganizationRepository organizationRepository, SubscriptionService subscriptionService) {
        this.organizationRepository = organizationRepository;
        this.subscriptionService = subscriptionService;
    }

    @Transactional
    public OrganizationResponse createOrganization(CreateOrganizationRequest request, Long userId, UUID userUuid) {
        if (organizationRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Organization already exists with name: " + request.getName());
        }

        Organization organization = new Organization(
            request.getName(), 
            request.getDescription(), 
            request.getType(), 
            userId,
            userUuid, 
            userId
        );
        organization = organizationRepository.save(organization);

        if (request.getSubscriptionPackageUuid() != null) {
            SubscribeOrganizationRequest subRequest = new SubscribeOrganizationRequest();
            subRequest.setOrganizationUuid(organization.getOrganizationUuid());
            subRequest.setPackageUuid(request.getSubscriptionPackageUuid());
            subRequest.setPaymentReference("AUTO-ACTIVATED");
            subscriptionService.subscribeOrganization(subRequest);
        }

        return mapToResponse(organization);
    }

    @Transactional
    public OrganizationResponse updateOrganization(UpdateOrganizationRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(request.getUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + request.getUuid()));

        if (!organization.getName().equals(request.getName()) && organizationRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Organization already exists with name: " + request.getName());
        }

        organization.setName(request.getName());
        organization.setDescription(request.getDescription());
        if (request.getType() != null) {
            organization.setType(request.getType());
        }

        organization.setUpdatedBy(currentUserId);
        
        organization = organizationRepository.save(organization);

        return mapToResponse(organization);
    }

    @Transactional
    public void deleteOrganization(UUID uuid, Long userId) {
        Organization organization = organizationRepository.findByOrganizationUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + uuid));
        
        organization.setActive(false);
        organization.setUpdatedBy(userId);
        organizationRepository.save(organization);
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getOrganizationByUuid(UUID uuid) {
        Organization organization = organizationRepository.findByOrganizationUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + uuid));
                
        return mapToResponse(organization);
    }
    
    @Transactional(readOnly = true)
    public List<OrganizationResponse> getAllOrganizations() {
        return organizationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrganizationResponse> getOrganizationsByUserUuid(UUID userUuid) {
        return organizationRepository.findByUserUuid(userUuid).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private OrganizationResponse mapToResponse(Organization organization) {
        OrganizationResponse response = new OrganizationResponse();
        response.setOrgId(organization.getOrganizationId());
        response.setUuid(organization.getOrganizationUuid());
        response.setName(organization.getName());
        response.setDescription(organization.getDescription());
        response.setActive(organization.isActive());
        response.setType(organization.getType());
        return response;
    }
}
