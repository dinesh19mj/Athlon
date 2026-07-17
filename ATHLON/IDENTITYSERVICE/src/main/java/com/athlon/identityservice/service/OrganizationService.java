package com.athlon.identityservice.service;

import com.athlon.identityservice.dto.request.CreateOrganizationRequest;
import com.athlon.identityservice.dto.request.UpdateOrganizationRequest;
import com.athlon.identityservice.dto.response.OrganizationResponse;
import com.athlon.identityservice.entity.Organization;
import com.athlon.identityservice.exception.DuplicateResourceException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    public OrganizationService(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @Transactional
    public OrganizationResponse createOrganization(CreateOrganizationRequest request, Long currentUserId) {
        if (organizationRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Organization already exists with name: " + request.getName());
        }

        Organization organization = new Organization(request.getName(), request.getDescription(), currentUserId);
        organization = organizationRepository.save(organization);

        return mapToResponse(organization);
    }

    @Transactional
    public OrganizationResponse updateOrganization(UpdateOrganizationRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByUuid(request.getUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + request.getUuid()));

        if (!organization.getName().equals(request.getName()) && organizationRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Organization already exists with name: " + request.getName());
        }

        organization.setName(request.getName());
        organization.setDescription(request.getDescription());
        organization.setUpdatedBy(currentUserId);
        
        organization = organizationRepository.save(organization);

        return mapToResponse(organization);
    }

    @Transactional
    public void deleteOrganization(UUID uuid, Long currentUserId) {
        Organization organization = organizationRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + uuid));
        
        organization.setActive(false);
        organization.setUpdatedBy(currentUserId);
        organizationRepository.save(organization);
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getOrganizationByUuid(UUID uuid) {
        Organization organization = organizationRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + uuid));
                
        return mapToResponse(organization);
    }
    
    @Transactional(readOnly = true)
    public List<OrganizationResponse> getAllOrganizations() {
        return organizationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private OrganizationResponse mapToResponse(Organization organization) {
        OrganizationResponse response = new OrganizationResponse();
        response.setUuid(organization.getUuid());
        response.setName(organization.getName());
        response.setDescription(organization.getDescription());
        response.setActive(organization.isActive());
        return response;
    }
}
