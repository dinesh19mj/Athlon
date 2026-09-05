package com.athlon.identityservice.organization.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.identityservice.exception.DuplicateResourceException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.dto.request.AddAcademyStaffRequest;
import com.athlon.identityservice.organization.dto.response.AcademyStaffResponse;
import com.athlon.identityservice.organization.entity.AcademyCentre;
import com.athlon.identityservice.organization.entity.AcademyStaff;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.entity.OrganizationMember;
import com.athlon.identityservice.organization.repository.AcademyCentreRepository;
import com.athlon.identityservice.organization.repository.AcademyStaffRepository;
import com.athlon.identityservice.organization.repository.OrganizationMemberRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.user.entity.User;
import com.athlon.identityservice.user.entity.UserProfile;
import com.athlon.identityservice.user.repository.UserProfileRepository;
import com.athlon.identityservice.user.repository.UserRepository;

@Service
public class AcademyStaffService {

    private final AcademyStaffRepository staffRepository;
    private final OrganizationRepository organizationRepository;
    private final AcademyCentreRepository centreRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final OrganizationMemberRepository organizationMemberRepository;

    public AcademyStaffService(AcademyStaffRepository staffRepository,
                               OrganizationRepository organizationRepository,
                               AcademyCentreRepository centreRepository,
                               UserRepository userRepository,
                               UserProfileRepository userProfileRepository,
                               OrganizationMemberRepository organizationMemberRepository) {
        this.staffRepository = staffRepository;
        this.organizationRepository = organizationRepository;
        this.centreRepository = centreRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.organizationMemberRepository = organizationMemberRepository;
    }

    public List<AcademyStaffResponse> getStaffByOrganization(UUID organizationUuid, String staffType) {
        List<AcademyStaff> list;
        if (staffType != null && !staffType.trim().isEmpty() && !staffType.equalsIgnoreCase("ALL")) {
            list = staffRepository.findByOrganizationUuidAndStaffTypeAndIsActive(organizationUuid, staffType.toUpperCase(), 1);
        } else {
            list = staffRepository.findByOrganizationUuidAndIsActive(organizationUuid, 1);
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AcademyStaffResponse> getCoaches(UUID organizationUuid) {
        List<AcademyStaff> list = staffRepository.findByOrganizationUuidAndIsActive(organizationUuid, 1);
        if (!list.isEmpty()) {
            return list.stream()
                    .filter(s -> "COACH".equalsIgnoreCase(s.getStaffType()) || AcademyStaff.isCoachRole(s.getRole()))
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        // Legacy fallback from organization_members
        List<OrganizationMember> members = organizationMemberRepository.findByOrganizationUuid(organizationUuid);
        return members.stream()
                .filter(m -> m.getIsActive() != null && m.getIsActive() == 1)
                .filter(m -> {
                    String r = (m.getRole() != null ? m.getRole() : "").toUpperCase();
                    return r.contains("COACH") || r.contains("TRAINER") || r.equals("MEMBER") || r.equals("ORGANIZER") || r.equals("ADMIN");
                })
                .map(this::mapMemberToResponse)
                .collect(Collectors.toList());
    }

    public List<AcademyStaffResponse> getOperationalStaff(UUID organizationUuid) {
        List<AcademyStaff> list = staffRepository.findByOrganizationUuidAndIsActive(organizationUuid, 1);
        if (!list.isEmpty()) {
            return list.stream()
                    .filter(s -> !"COACH".equalsIgnoreCase(s.getStaffType()) && !AcademyStaff.isCoachRole(s.getRole()))
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        // Legacy fallback from organization_members
        List<OrganizationMember> members = organizationMemberRepository.findByOrganizationUuid(organizationUuid);
        return members.stream()
                .filter(m -> m.getIsActive() != null && m.getIsActive() == 1)
                .filter(m -> {
                    String r = (m.getRole() != null ? m.getRole() : "").toUpperCase();
                    return !(r.contains("COACH") || r.contains("TRAINER"));
                })
                .map(this::mapMemberToResponse)
                .collect(Collectors.toList());
    }

    public AcademyStaffResponse getStaffByUuid(UUID staffUuid) {
        AcademyStaff staff = staffRepository.findByStaffUuid(staffUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Staff record not found with UUID: " + staffUuid));
        return mapToResponse(staff);
    }

    @Transactional
    public AcademyStaffResponse addStaffByPhone(UUID organizationUuid, AddAcademyStaffRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(organizationUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + organizationUuid));

        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }

        String rawPhone = request.getPhone().trim();
        String cleanPhone = rawPhone.replaceAll("[^0-9]", "");

        UserProfile userProfile = userProfileRepository.findFirstByPhone(cleanPhone)
                .or(() -> userProfileRepository.findFirstByPhone(rawPhone))
                .orElseThrow(() -> new ResourceNotFoundException("No active Athlon user found with phone: " + request.getPhone() + ". Please create an Athlon account first."));

        User user = userRepository.findById(userProfile.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User account not found for phone: " + request.getPhone()));

        if (!user.isActive()) {
            throw new ResourceNotFoundException("User account is inactive for phone: " + request.getPhone());
        }

        String role = request.getRole() != null ? request.getRole().trim().toUpperCase() : "COACH";
        String staffType = AcademyStaff.isCoachRole(role) ? "COACH" : "OPERATIONAL";

        // Centre resolution if provided
        Long centreId = null;
        UUID centreUuid = null;
        if (request.getCentreUuid() != null) {
            Optional<AcademyCentre> centreOpt = centreRepository.findByCentreUuid(request.getCentreUuid());
            if (centreOpt.isPresent()) {
                centreId = centreOpt.get().getCentreId();
                centreUuid = centreOpt.get().getCentreUuid();
            }
        }

        // Check if existing staff entry exists
        Optional<AcademyStaff> existingStaffOpt = staffRepository
                .findByOrganizationIdAndUserIdAndIsActive(organization.getOrganizationId(), user.getUserId(), 1);

        AcademyStaff staff;
        if (existingStaffOpt.isPresent()) {
            staff = existingStaffOpt.get();
            staff.setRole(role);
            staff.setStaffType(staffType);
            if (request.getSportType() != null) staff.setSportType(request.getSportType());
            if (centreId != null) {
                staff.setCentreId(centreId);
                staff.setCentreUuid(centreUuid);
            }
            staff.setUpdatedBy(currentUserId);
        } else {
            staff = new AcademyStaff(
                    organization.getOrganizationId(),
                    organization.getOrganizationUuid(),
                    user.getUserId(),
                    user.getUserUuid(),
                    staffType,
                    role,
                    request.getSportType(),
                    currentUserId
            );
            staff.setCentreId(centreId);
            staff.setCentreUuid(centreUuid);
        }

        // Populate cached fields from User & UserProfile
        String fullName = ((userProfile.getFirstName() != null ? userProfile.getFirstName() : "") + " " + (userProfile.getLastName() != null ? userProfile.getLastName() : "")).trim();
        staff.setFullName(fullName.isEmpty() ? "Athlon Staff" : fullName);
        staff.setPhone(userProfile.getPhone() != null ? userProfile.getPhone() : cleanPhone);
        staff.setEmail(user.getEmail());
        staff.setPhoto(userProfile.getPhoto());
        staff.setIsActive(1);

        staff = staffRepository.save(staff);

        // Also sync OrganizationMember table so unified permissions / workspace roles remain intact
        try {
            Optional<OrganizationMember> memberOpt = organizationMemberRepository
                    .findByOrganizationIdAndUserId(organization.getOrganizationId(), user.getUserId());
            OrganizationMember member;
            if (memberOpt.isPresent()) {
                member = memberOpt.get();
                member.setIsActive(1);
                member.setRole(role);
                if (request.getSportType() != null) member.setSportType(request.getSportType());
                member.setUpdatedBy(currentUserId);
            } else {
                member = new OrganizationMember(
                        organization.getOrganizationId(),
                        organization.getOrganizationUuid(),
                        user.getUserId(),
                        user.getUserUuid(),
                        role,
                        currentUserId
                );
                if (request.getSportType() != null) member.setSportType(request.getSportType());
            }
            organizationMemberRepository.save(member);
        } catch (Exception ignored) {
        }

        return mapToResponse(staff);
    }

    @Transactional
    public void removeStaff(UUID organizationUuid, UUID staffUuid, Long currentUserId) {
        Optional<AcademyStaff> staffOpt = staffRepository.findByStaffUuid(staffUuid);
        if (staffOpt.isPresent()) {
            AcademyStaff staff = staffOpt.get();
            staff.setIsActive(0);
            staff.setUpdatedBy(currentUserId);
            staffRepository.save(staff);

            // Also deactivate corresponding OrganizationMember if present
            try {
                if (staff.getOrganizationId() != null && staff.getUserId() != null) {
                    organizationMemberRepository.findByOrganizationIdAndUserId(staff.getOrganizationId(), staff.getUserId())
                            .ifPresent(m -> {
                                m.setIsActive(0);
                                m.setUpdatedBy(currentUserId);
                                organizationMemberRepository.save(m);
                            });
                }
            } catch (Exception ignored) {
            }
            return;
        }

        // Fallback: check organization_members table by UUID if record was created prior to academy_staff migration
        Optional<OrganizationMember> memberOpt = organizationMemberRepository.findByOrganizationMemberUuid(staffUuid);
        if (memberOpt.isPresent()) {
            OrganizationMember m = memberOpt.get();
            m.setIsActive(0);
            m.setUpdatedBy(currentUserId);
            organizationMemberRepository.save(m);
            return;
        }

        throw new ResourceNotFoundException("Staff record not found with UUID: " + staffUuid);
    }

    private AcademyStaffResponse mapToResponse(AcademyStaff staff) {
        AcademyStaffResponse resp = new AcademyStaffResponse();
        resp.setStaffUuid(staff.getStaffUuid());
        resp.setStaffId(staff.getStaffId());
        resp.setOrganizationUuid(staff.getOrganizationUuid());
        resp.setOrganizationId(staff.getOrganizationId());
        resp.setUserUuid(staff.getUserUuid());
        resp.setUserId(staff.getUserId());
        resp.setCentreUuid(staff.getCentreUuid());
        resp.setCentreId(staff.getCentreId());
        resp.setStaffType(staff.getStaffType());
        resp.setRole(staff.getRole());
        resp.setSportType(staff.getSportType());
        resp.setFullName(staff.getFullName());
        resp.setPhone(staff.getPhone());
        resp.setEmail(staff.getEmail());
        resp.setPhoto(staff.getPhoto());
        resp.setIsActive(staff.getIsActive());
        resp.setStatus(staff.getIsActive() != null && staff.getIsActive() == 1 ? "Active" : "Inactive");
        resp.setJoinedAt(staff.getCreatedAt() != null ? staff.getCreatedAt() : LocalDateTime.now());

        // Resolve centre name if assigned
        if (staff.getCentreId() != null) {
            centreRepository.findById(staff.getCentreId()).ifPresent(c -> {
                resp.setCentreName(c.getName());
            });
        }

        // Fresh profile fallback
        if (staff.getUserId() != null && (staff.getFullName() == null || staff.getFullName().isEmpty())) {
            userProfileRepository.findByUserId(staff.getUserId()).ifPresent(p -> {
                String fullName = ((p.getFirstName() != null ? p.getFirstName() : "") + " " + (p.getLastName() != null ? p.getLastName() : "")).trim();
                resp.setFullName(fullName.isEmpty() ? "Athlon Staff" : fullName);
                if (resp.getPhone() == null) resp.setPhone(p.getPhone());
                if (resp.getPhoto() == null) resp.setPhoto(p.getPhoto());
            });
            userRepository.findById(staff.getUserId()).ifPresent(u -> {
                if (resp.getEmail() == null) resp.setEmail(u.getEmail());
            });
        }

        return resp;
    }

    private AcademyStaffResponse mapMemberToResponse(OrganizationMember member) {
        AcademyStaffResponse resp = new AcademyStaffResponse();
        resp.setStaffUuid(member.getOrganizationMemberUuid());
        resp.setStaffId(member.getOrganizationMemberId());
        resp.setOrganizationUuid(member.getOrganizationUuid());
        resp.setOrganizationId(member.getOrganizationId());
        resp.setUserUuid(member.getUserUuid());
        resp.setUserId(member.getUserId());
        String role = member.getRole() != null ? member.getRole() : "COACH";
        resp.setRole(role);
        resp.setStaffType(AcademyStaff.isCoachRole(role) ? "COACH" : "OPERATIONAL");
        resp.setSportType(member.getSportType());
        resp.setIsActive(member.getIsActive());
        resp.setStatus(member.getIsActive() != null && member.getIsActive() == 1 ? "Active" : "Inactive");
        resp.setJoinedAt(member.getCreatedAt() != null ? member.getCreatedAt() : LocalDateTime.now());

        if (member.getUserId() != null) {
            userProfileRepository.findByUserId(member.getUserId()).ifPresent(p -> {
                String fullName = ((p.getFirstName() != null ? p.getFirstName() : "") + " " + (p.getLastName() != null ? p.getLastName() : "")).trim();
                resp.setFullName(fullName.isEmpty() ? "Athlon Staff" : fullName);
                resp.setPhone(p.getPhone());
                resp.setPhoto(p.getPhoto());
            });
            userRepository.findById(member.getUserId()).ifPresent(u -> {
                resp.setEmail(u.getEmail());
            });
        }
        if (resp.getFullName() == null || resp.getFullName().isEmpty()) {
            resp.setFullName("Athlon Staff");
        }
        return resp;
    }
}
