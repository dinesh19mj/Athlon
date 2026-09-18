package com.athlon.identityservice.organization.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.identityservice.exception.DuplicateResourceException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.dto.request.AddVenueStaffRequest;
import com.athlon.identityservice.organization.dto.request.UpdateVenueStaffRequest;
import com.athlon.identityservice.organization.dto.response.VenueStaffResponse;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.entity.OrganizationMember;
import com.athlon.identityservice.organization.entity.VenueStaff;
import com.athlon.identityservice.organization.repository.OrganizationMemberRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.organization.repository.VenueStaffRepository;
import com.athlon.identityservice.user.entity.User;
import com.athlon.identityservice.user.entity.UserProfile;
import com.athlon.identityservice.user.repository.UserProfileRepository;
import com.athlon.identityservice.user.repository.UserRepository;

@Service
public class VenueStaffService {

    private final VenueStaffRepository staffRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public VenueStaffService(
            VenueStaffRepository staffRepository,
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository organizationMemberRepository,
            UserRepository userRepository,
            UserProfileRepository userProfileRepository) {
        this.staffRepository = staffRepository;
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional(readOnly = true)
    public List<VenueStaffResponse> getStaff(UUID organizationUuid, String role) {
        List<VenueStaff> list;
        if (role != null && !role.trim().isEmpty() && !role.equalsIgnoreCase("ALL")) {
            list = staffRepository.findByOrganizationUuidAndRoleAndIsActiveOrderByCreatedAtDesc(organizationUuid, role.toUpperCase(), 1);
        } else {
            list = staffRepository.findByOrganizationUuidAndIsActiveOrderByCreatedAtDesc(organizationUuid, 1);
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VenueStaffResponse getStaffByUuid(UUID staffUuid) {
        VenueStaff staff = staffRepository.findByStaffUuid(staffUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Venue staff member not found with UUID: " + staffUuid));
        return mapToResponse(staff);
    }

    @Transactional
    public VenueStaffResponse addStaffByPhone(UUID organizationUuid, AddVenueStaffRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(organizationUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + organizationUuid));

        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }

        String rawPhone = request.getPhone().trim();
        String cleanPhone = rawPhone.replaceAll("[^0-9]", "");

        UserProfile userProfile = userProfileRepository.findFirstByPhone(cleanPhone)
                .or(() -> userProfileRepository.findFirstByPhone(rawPhone))
                .orElseThrow(() -> new ResourceNotFoundException("No active Athlon user found with phone: " + request.getPhone() + ". Please ask the staff member to register an Athlon account first."));

        User user = userRepository.findById(userProfile.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User account not found for phone: " + request.getPhone()));

        if (user.getIsActive() == null || user.getIsActive() != 1) {
            throw new ResourceNotFoundException("User account is currently inactive for phone: " + request.getPhone());
        }

        String role = request.getRole() != null ? request.getRole().trim().toUpperCase() : "FRONT_DESK";

        // Check if user is already an active staff in this venue workspace
        Optional<VenueStaff> existingOpt = staffRepository.findByOrganizationUuidAndUserId(organizationUuid, user.getUserId());
        VenueStaff staff;

        if (existingOpt.isPresent()) {
            VenueStaff existing = existingOpt.get();
            if (existing.getIsActive() != null && existing.getIsActive() == 1) {
                throw new DuplicateResourceException("This Athlon user is already an active staff member with role: " + existing.getRole());
            }
            // Reactivate existing record
            existing.setIsActive(1);
            existing.setRole(role);
            if (request.getDesignation() != null) existing.setDesignation(request.getDesignation());
            if (request.getAssignedFacilities() != null) existing.setAssignedFacilities(request.getAssignedFacilities());
            if (request.getNotes() != null) existing.setNotes(request.getNotes());
            existing.setUpdatedBy(currentUserId);
            staff = staffRepository.save(existing);
        } else {
            staff = new VenueStaff(
                    organization.getOrganizationId(),
                    organization.getOrganizationUuid(),
                    user.getUserId(),
                    user.getUserUuid(),
                    role,
                    request.getDesignation(),
                    currentUserId
            );
            staff.setAssignedFacilities(request.getAssignedFacilities());
            staff.setNotes(request.getNotes());
            staff.setUpdatedBy(currentUserId);
            staff = staffRepository.save(staff);
        }

        // Synchronize with organization_members for authentication/workspace routing
        syncOrganizationMember(organization, user, role, currentUserId);

        return mapToResponse(staff);
    }

    @Transactional
    public VenueStaffResponse updateStaff(UpdateVenueStaffRequest request, Long currentUserId) {
        VenueStaff staff = staffRepository.findByStaffUuid(request.getStaffUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Venue staff member not found with UUID: " + request.getStaffUuid()));

        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            staff.setRole(request.getRole().trim().toUpperCase());
        }
        if (request.getDesignation() != null) {
            staff.setDesignation(request.getDesignation());
        }
        if (request.getAssignedFacilities() != null) {
            staff.setAssignedFacilities(request.getAssignedFacilities());
        }
        if (request.getNotes() != null) {
            staff.setNotes(request.getNotes());
        }
        if (request.getIsActive() != null) {
            staff.setIsActive(request.getIsActive());
        }
        staff.setUpdatedBy(currentUserId);

        VenueStaff saved = staffRepository.save(staff);

        // Update role in organization_members
        organizationRepository.findByOrganizationUuid(saved.getOrganizationUuid()).ifPresent(org -> {
            userRepository.findById(saved.getUserId()).ifPresent(u -> {
                if (saved.getIsActive() != null && saved.getIsActive() == 0) {
                    removeOrganizationMember(org, u, currentUserId);
                } else {
                    syncOrganizationMember(org, u, saved.getRole(), currentUserId);
                }
            });
        });

        return mapToResponse(saved);
    }

    @Transactional
    public void removeStaff(UUID staffUuid, Long currentUserId) {
        VenueStaff staff = staffRepository.findByStaffUuid(staffUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Venue staff member not found with UUID: " + staffUuid));

        // Soft delete / deactivate
        staff.setIsActive(0);
        staff.setUpdatedBy(currentUserId);
        staffRepository.save(staff);

        // Deactivate in organization_members
        organizationMemberRepository.findByOrganizationUuidAndUserId(staff.getOrganizationUuid(), staff.getUserId())
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

    private void removeOrganizationMember(Organization organization, User user, Long currentUserId) {
        organizationMemberRepository
                .findByOrganizationUuidAndUserId(organization.getOrganizationUuid(), user.getUserId())
                .ifPresent(m -> {
                    m.setIsActive(0);
                    m.setUpdatedBy(currentUserId);
                    organizationMemberRepository.save(m);
                });
    }

    private VenueStaffResponse mapToResponse(VenueStaff staff) {
        VenueStaffResponse resp = new VenueStaffResponse();
        resp.setStaffUuid(staff.getStaffUuid());
        resp.setOrganizationUuid(staff.getOrganizationUuid());
        resp.setOrganizationId(staff.getOrganizationId());
        resp.setUserId(staff.getUserId());
        resp.setUserUuid(staff.getUserUuid());
        resp.setRole(staff.getRole());
        resp.setDesignation(staff.getDesignation());
        resp.setAssignedFacilities(staff.getAssignedFacilities());
        resp.setNotes(staff.getNotes());
        resp.setIsActive(staff.getIsActive());
        resp.setCreatedAt(staff.getCreatedAt());
        resp.setUpdatedAt(staff.getUpdatedAt());

        // Hydrate User details
        try {
            userRepository.findById(staff.getUserId()).ifPresent(u -> {
                resp.setEmail(u.getEmail());
            });

            userProfileRepository.findByUserId(staff.getUserId()).ifPresent(p -> {
                resp.setFirstName(p.getFirstName());
                resp.setLastName(p.getLastName());
                String fullName = ((p.getFirstName() != null ? p.getFirstName() : "") + " " + (p.getLastName() != null ? p.getLastName() : "")).trim();
                resp.setFullName(fullName.isEmpty() ? "Staff Member" : fullName);
                resp.setPhone(p.getPhone());
                resp.setPhoto(p.getPhoto());
            });
        } catch (Exception ignored) {
            // Safe fallback
        }

        if (resp.getFullName() == null || resp.getFullName().isEmpty()) {
            resp.setFullName("Staff Member");
        }

        return resp;
    }
}
