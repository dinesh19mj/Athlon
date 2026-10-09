package com.athlon.identityservice.admin.service;

import com.athlon.identityservice.admin.dto.AdminUserResponse;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.security.entity.Role;
import com.athlon.identityservice.security.entity.UserRole;
import com.athlon.identityservice.security.repository.RoleRepository;
import com.athlon.identityservice.security.repository.UserRoleRepository;
import com.athlon.identityservice.user.entity.User;
import com.athlon.identityservice.user.entity.UserProfile;
import com.athlon.identityservice.user.repository.UserProfileRepository;
import com.athlon.identityservice.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final AdminAuditService adminAuditService;

    public AdminUserService(UserRepository userRepository,
                            UserProfileRepository userProfileRepository,
                            OrganizationRepository organizationRepository,
                            UserRoleRepository userRoleRepository,
                            RoleRepository roleRepository,
                            AdminAuditService adminAuditService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.organizationRepository = organizationRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.adminAuditService = adminAuditService;
    }

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> getUsers(String query, Integer isActive, Pageable pageable) {
        Page<User> usersPage;
        if (query != null && !query.trim().isEmpty()) {
            usersPage = userRepository.searchByEmail(query.trim(), pageable);
        } else if (isActive != null) {
            usersPage = userRepository.findByIsActive(isActive, pageable);
        } else {
            usersPage = userRepository.findAll(pageable);
        }

        List<AdminUserResponse> dtos = usersPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, usersPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUserDetail(UUID userUuid) {
        User user = userRepository.findByUserUuid(userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with UUID: " + userUuid));
        return mapToResponse(user);
    }

    @Transactional
    public AdminUserResponse updateUserStatus(UUID userUuid,
                                             Integer newStatus,
                                             String reason,
                                             Long adminUserId,
                                             UUID adminUserUuid,
                                             String adminEmail,
                                             String requestIp) {
        User user = userRepository.findByUserUuid(userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with UUID: " + userUuid));

        Integer previousStatus = user.getIsActive();
        user.setIsActive(newStatus);
        user = userRepository.save(user);

        // Record audit
        String action = newStatus != null && newStatus == 1 ? "USER_REACTIVATED" : "USER_SUSPENDED";
        adminAuditService.record(
                adminUserId,
                adminUserUuid,
                adminEmail,
                action,
                "USER",
                user.getUserUuid().toString(),
                "{\"isActive\":" + previousStatus + "}",
                "{\"isActive\":" + newStatus + "}",
                reason,
                requestIp
        );

        return mapToResponse(user);
    }

    private AdminUserResponse mapToResponse(User user) {
        AdminUserResponse resp = new AdminUserResponse();
        resp.setUserId(user.getUserId());
        resp.setUserUuid(user.getUserUuid());
        resp.setEmail(user.getEmail());
        resp.setIsActive(user.getIsActive());
        resp.setCreatedAt(user.getCreatedAt());

        Optional<UserProfile> profileOpt = userProfileRepository.findByUserUuid(user.getUserUuid());
        if (profileOpt.isPresent()) {
            UserProfile p = profileOpt.get();
            resp.setFirstName(p.getFirstName());
            resp.setLastName(p.getLastName());
            resp.setPhone(p.getPhone());
            resp.setCity(p.getCity());
        }

        // Roles
        List<UserRole> userRoles = userRoleRepository.findByUserId(user.getUserId());
        List<String> roleNames = new ArrayList<>();
        for (UserRole ur : userRoles) {
            if (ur.isActive()) {
                roleRepository.findById(ur.getRoleId()).ifPresent(r -> {
                    if (r.isActive()) {
                        roleNames.add(r.getName());
                    }
                });
            }
        }
        resp.setRoles(roleNames);

        // Organizations count
        resp.setOrganizationCount(organizationRepository.findByUserUuid(user.getUserUuid()).size());

        return resp;
    }
}
