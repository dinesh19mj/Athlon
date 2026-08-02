package com.athlon.identityservice.organization.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.athlon.identityservice.organization.model.Organization;
import com.athlon.identityservice.organization.model.OrganizationMember;
import com.athlon.identityservice.organization.repository.OrganizationMemberRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrganizationService {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationMemberRepository organizationMemberRepository;

    public Organization createOrganization(Organization organization) {
        organization.setOrgUuid(UUID.randomUUID());
        organization.setCreatedOn(LocalDateTime.now());
        organization.setIsActive(1);
        if (organization.getStatus() == null) {
            organization.setStatus("ACTIVE");
        }
        return organizationRepository.save(organization);
    }

    public Organization updateOrganization(Long orgId, Organization orgDetails) {
        Organization existingOrg = organizationRepository.findById(orgId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));
        
        if (orgDetails.getName() != null) existingOrg.setName(orgDetails.getName());
        if (orgDetails.getEmail() != null) existingOrg.setEmail(orgDetails.getEmail());
        if (orgDetails.getPhoneNumber() != null) existingOrg.setPhoneNumber(orgDetails.getPhoneNumber());
        if (orgDetails.getLogo() != null) existingOrg.setLogo(orgDetails.getLogo());
        if (orgDetails.getStatus() != null) existingOrg.setStatus(orgDetails.getStatus());
        
        existingOrg.setModifiedOn(LocalDateTime.now());
        return organizationRepository.save(existingOrg);
    }

    public Organization updateSubscriptionStatus(Long orgId, String status, String paymentRef) {
        Organization existingOrg = organizationRepository.findById(orgId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));
        
        existingOrg.setSubscriptionStatus(status);
        if (paymentRef != null) {
            existingOrg.setPaymentReference(paymentRef);
        }
        existingOrg.setModifiedOn(LocalDateTime.now());
        return organizationRepository.save(existingOrg);
    }

    public Organization getOrganizationById(Long orgId) {
        return organizationRepository.findById(orgId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));
    }

    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    public OrganizationMember addMemberToOrganization(Long orgId, Long playerId, String role) {
        OrganizationMember member = new OrganizationMember();
        member.setOrgId(orgId);
        member.setPlayerId(playerId);
        member.setRole(role);
        member.setStatus("ACTIVE");
        member.setIsActive(1);
        member.setCreatedOn(LocalDateTime.now());
        return organizationMemberRepository.save(member);
    }

    public List<OrganizationMember> getOrganizationMembers(Long orgId) {
        return organizationMemberRepository.findByOrgId(orgId);
    }
}
