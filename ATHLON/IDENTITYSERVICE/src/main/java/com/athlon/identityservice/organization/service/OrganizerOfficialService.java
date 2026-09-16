package com.athlon.identityservice.organization.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.identityservice.exception.DuplicateResourceException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.dto.request.AddOrganizerOfficialRequest;
import com.athlon.identityservice.organization.dto.request.UpdateOrganizerOfficialRequest;
import com.athlon.identityservice.organization.dto.response.OrganizerOfficialResponse;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.entity.OrganizationMember;
import com.athlon.identityservice.organization.entity.OrganizerOfficial;
import com.athlon.identityservice.organization.repository.OrganizationMemberRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.organization.repository.OrganizerOfficialRepository;
import com.athlon.identityservice.user.entity.User;
import com.athlon.identityservice.user.entity.UserProfile;
import com.athlon.identityservice.user.repository.UserProfileRepository;
import com.athlon.identityservice.user.repository.UserRepository;

@Service
public class OrganizerOfficialService {

    private final OrganizerOfficialRepository officialRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public OrganizerOfficialService(
            OrganizerOfficialRepository officialRepository,
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository organizationMemberRepository,
            UserRepository userRepository,
            UserProfileRepository userProfileRepository) {
        this.officialRepository = officialRepository;
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional(readOnly = true)
    public List<OrganizerOfficialResponse> getOfficials(UUID organizationUuid, String role) {
        List<OrganizerOfficial> list;
        if (role != null && !role.trim().isEmpty() && !"ALL".equalsIgnoreCase(role)) {
            list = officialRepository.findByOrganizationUuidAndRoleAndIsActiveOrderByCreatedAtDesc(organizationUuid, role.toUpperCase(), 1);
        } else {
            list = officialRepository.findByOrganizationUuidAndIsActiveOrderByCreatedAtDesc(organizationUuid, 1);
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrganizerOfficialResponse getOfficialByUuid(UUID officialUuid) {
        OrganizerOfficial official = officialRepository.findByOfficialUuid(officialUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Official not found with UUID: " + officialUuid));
        return mapToResponse(official);
    }

    @Transactional
    public OrganizerOfficialResponse addOfficialByPhone(UUID organizationUuid, AddOrganizerOfficialRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(organizationUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + organizationUuid));

        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }

        String rawPhone = request.getPhone().trim();
        String cleanPhone = rawPhone.replaceAll("[^0-9]", "");

        UserProfile userProfile = userProfileRepository.findFirstByPhone(cleanPhone)
                .or(() -> userProfileRepository.findFirstByPhone(rawPhone))
                .orElseThrow(() -> new ResourceNotFoundException("No active Athlon user found with phone: " + request.getPhone() + ". Please ask the official to register an Athlon account first."));

        User user = userRepository.findById(userProfile.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User account not found for phone: " + request.getPhone()));

        if (!user.isActive()) {
            throw new ResourceNotFoundException("User account is currently inactive for phone: " + request.getPhone());
        }

        String role = request.getRole() != null ? request.getRole().trim().toUpperCase() : "TOURNAMENT_DIRECTOR";

        // Check if user is already an active official in this organizer workspace
        Optional<OrganizerOfficial> existingOpt = officialRepository.findByOrganizationUuidAndUserId(organizationUuid, user.getUserId());
        OrganizerOfficial official;

        if (existingOpt.isPresent()) {
            OrganizerOfficial existing = existingOpt.get();
            if (existing.isActive()) {
                throw new DuplicateResourceException("This Athlon user is already an active official with role: " + existing.getRole());
            }
            // Reactivate existing record
            existing.setIsActive(1);
            existing.setRole(role);
            if (request.getDesignation() != null) existing.setDesignation(request.getDesignation());
            if (request.getAssignedTournaments() != null) existing.setAssignedTournaments(request.getAssignedTournaments());
            if (request.getNotes() != null) existing.setNotes(request.getNotes());
            existing.setUpdatedBy(currentUserId);
            official = officialRepository.save(existing);
        } else {
            official = new OrganizerOfficial(
                    organization.getOrganizationId(),
                    organization.getOrganizationUuid(),
                    user.getUserId(),
                    user.getUserUuid(),
                    role,
                    request.getDesignation(),
                    currentUserId
            );
            official.setAssignedTournaments(request.getAssignedTournaments());
            official.setNotes(request.getNotes());
            official.setUpdatedBy(currentUserId);
            official = officialRepository.save(official);
        }

        // Synchronize with organization_members for authentication/workspace routing
        syncOrganizationMember(organization, user, role, currentUserId);

        return mapToResponse(official);
    }

    @Transactional
    public OrganizerOfficialResponse updateOfficial(UpdateOrganizerOfficialRequest request, Long currentUserId) {
        OrganizerOfficial official = officialRepository.findByOfficialUuid(request.getOfficialUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Official record not found with UUID: " + request.getOfficialUuid()));

        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            official.setRole(request.getRole().trim().toUpperCase());
        }
        if (request.getDesignation() != null) {
            official.setDesignation(request.getDesignation());
        }
        if (request.getAssignedTournaments() != null) {
            official.setAssignedTournaments(request.getAssignedTournaments());
        }
        if (request.getNotes() != null) {
            official.setNotes(request.getNotes());
        }
        if (request.getIsActive() != null) {
            official.setIsActive(request.getIsActive());
        }
        official.setUpdatedBy(currentUserId);

        OrganizerOfficial saved = officialRepository.save(official);

        // Update role in organization_members
        organizationRepository.findByOrganizationUuid(saved.getOrganizationUuid()).ifPresent(org -> {
            userRepository.findById(saved.getUserId()).ifPresent(u -> {
                syncOrganizationMember(org, u, saved.getRole(), currentUserId);
            });
        });

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteOfficial(UUID officialUuid, Long currentUserId) {
        OrganizerOfficial official = officialRepository.findByOfficialUuid(officialUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Official record not found with UUID: " + officialUuid));

        // Soft delete / deactivate
        official.setIsActive(0);
        official.setUpdatedBy(currentUserId);
        officialRepository.save(official);

        // Deactivate in organization_members
        organizationMemberRepository.findByOrganizationUuidAndUserId(official.getOrganizationUuid(), official.getUserId())
                .ifPresent(m -> {
                    m.setIsActive(0);
                    m.setUpdatedBy(currentUserId);
                    organizationMemberRepository.save(m);
                });
    }

    private void syncOrganizationMember(Organization organization, User user, String role, Long currentUserId) {
        Optional<OrganizationMember> memberOpt = organizationMemberRepository
                .findByOrganizationUuidAndUserId(organization.getOrganizationUuid(), user.getUserId());

        if (memberOpt.isPresent()) {
            OrganizationMember member = memberOpt.get();
            member.setRole(role);
            member.setIsActive(1);
            member.setUpdatedBy(currentUserId);
            organizationMemberRepository.save(member);
        } else {
            OrganizationMember newMember = new OrganizationMember(
                    organization.getOrganizationId(),
                    organization.getOrganizationUuid(),
                    user.getUserId(),
                    user.getUserUuid(),
                    role,
                    currentUserId
            );
            organizationMemberRepository.save(newMember);
        }
    }

    private OrganizerOfficialResponse mapToResponse(OrganizerOfficial official) {
        OrganizerOfficialResponse resp = new OrganizerOfficialResponse();
        resp.setOfficialUuid(official.getOfficialUuid());
        resp.setOrganizationUuid(official.getOrganizationUuid());
        resp.setUserId(official.getUserId());
        resp.setUserUuid(official.getUserUuid());
        resp.setRole(official.getRole());
        resp.setDesignation(official.getDesignation());
        resp.setAssignedTournaments(official.getAssignedTournaments());
        resp.setNotes(official.getNotes());
        resp.setIsActive(official.getIsActive());
        resp.setCreatedAt(official.getCreatedAt());
        resp.setUpdatedAt(official.getUpdatedAt());

        // Hydrate User details
        try {
            userRepository.findById(official.getUserId()).ifPresent(u -> {
                resp.setEmail(u.getEmail());
            });

            userProfileRepository.findByUserId(official.getUserId()).ifPresent(p -> {
                resp.setFirstName(p.getFirstName());
                resp.setLastName(p.getLastName());
                String fullName = ((p.getFirstName() != null ? p.getFirstName() : "") + " " + (p.getLastName() != null ? p.getLastName() : "")).trim();
                resp.setFullName(fullName.isEmpty() ? "Official" : fullName);
                resp.setPhone(p.getPhone());
                resp.setPhoto(p.getPhoto());
            });
        } catch (Exception ignored) {
            // Safe fallback
        }

        if (resp.getFullName() == null || resp.getFullName().isEmpty()) {
            resp.setFullName("Official");
        }

        return resp;
    }
}
