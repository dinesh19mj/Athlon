package com.athlon.identityservice.organization.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.identityservice.organization.dto.request.SaveRolePermissionsRequest;
import com.athlon.identityservice.organization.dto.response.ClubRolePermissionResponse;
import com.athlon.identityservice.organization.entity.ClubRolePermission;
import com.athlon.identityservice.organization.repository.ClubRolePermissionRepository;

@Service
public class ClubPermissionService {

    private final ClubRolePermissionRepository permissionRepository;

    public static final List<String> CLUB_MODULES = Arrays.asList(
            "tournaments", "members", "matches", "attendance", "leaderboard", "posts",
            "inventory", "finances", "analytics", "settings"
    );

    public static final List<String> CLUB_ROLES = Arrays.asList(
            "ADMIN", "MEMBER"
    );

    public ClubPermissionService(ClubRolePermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    public List<ClubRolePermissionResponse> getPermissionsForOrganization(UUID organizationUuid) {
        List<ClubRolePermission> existing = permissionRepository.findByOrganizationUuid(organizationUuid);
        if (existing.isEmpty()) {
            return generateDefaultPermissions(organizationUuid);
        }
        return existing.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ClubRolePermissionResponse> getPermissionsForRole(UUID organizationUuid, String role) {
        String normalizedRole = role != null ? role.toUpperCase() : "MEMBER";
        List<ClubRolePermission> existing = permissionRepository.findByOrganizationUuidAndRole(organizationUuid, normalizedRole);
        if (existing.isEmpty()) {
            return generateDefaultPermissions(organizationUuid).stream()
                    .filter(p -> p.getRole().equalsIgnoreCase(normalizedRole))
                    .collect(Collectors.toList());
        }
        return existing.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<ClubRolePermissionResponse> savePermissions(UUID organizationUuid, SaveRolePermissionsRequest request) {
        if (request == null || request.getPermissions() == null || request.getPermissions().isEmpty()) {
            return getPermissionsForOrganization(organizationUuid);
        }

        List<ClubRolePermission> toSave = new ArrayList<>();
        for (SaveRolePermissionsRequest.RolePermissionItem item : request.getPermissions()) {
            if (item.getRole() == null || item.getModuleId() == null) {
                continue;
            }

            String role = item.getRole().toUpperCase();
            String moduleId = item.getModuleId().toLowerCase();
            String accessLevel = item.getAccessLevel() != null ? item.getAccessLevel().toUpperCase() : "VIEW";

            Optional<ClubRolePermission> existingOpt = permissionRepository
                    .findByOrganizationUuidAndRoleAndModuleId(organizationUuid, role, moduleId);

            ClubRolePermission entity;
            if (existingOpt.isPresent()) {
                entity = existingOpt.get();
                entity.setAccessLevel(accessLevel);
            } else {
                entity = new ClubRolePermission(organizationUuid, role, moduleId, accessLevel);
            }
            toSave.add(entity);
        }

        List<ClubRolePermission> saved = permissionRepository.saveAll(toSave);
        return saved.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<ClubRolePermissionResponse> resetPermissionsToDefault(UUID organizationUuid) {
        permissionRepository.deleteByOrganizationUuid(organizationUuid);
        List<ClubRolePermissionResponse> defaults = generateDefaultPermissions(organizationUuid);
        List<ClubRolePermission> entities = defaults.stream()
                .map(d -> new ClubRolePermission(organizationUuid, d.getRole(), d.getModuleId(), d.getAccessLevel()))
                .collect(Collectors.toList());
        List<ClubRolePermission> saved = permissionRepository.saveAll(entities);
        return saved.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private List<ClubRolePermissionResponse> generateDefaultPermissions(UUID organizationUuid) {
        List<ClubRolePermissionResponse> defaults = new ArrayList<>();
        Map<String, Map<String, String>> defaultMatrix = getClubDefaultMatrix();

        for (String role : CLUB_ROLES) {
            Map<String, String> moduleMap = defaultMatrix.getOrDefault(role, new HashMap<>());
            for (String moduleId : CLUB_MODULES) {
                String level = moduleMap.getOrDefault(moduleId, role.equals("ADMIN") ? "MANAGE" : "VIEW");
                defaults.add(new ClubRolePermissionResponse(
                        UUID.randomUUID(),
                        organizationUuid,
                        role,
                        moduleId,
                        level
                ));
            }
        }
        return defaults;
    }

    public static Map<String, Map<String, String>> getClubDefaultMatrix() {
        Map<String, Map<String, String>> matrix = new HashMap<>();

        // ADMIN: Full access to everything
        Map<String, String> adminMap = new HashMap<>();
        for (String mod : CLUB_MODULES) {
            adminMap.put(mod, "MANAGE");
        }
        matrix.put("ADMIN", adminMap);

        // MEMBER: Standard member permissions
        Map<String, String> memberMap = new HashMap<>();
        memberMap.put("tournaments", "MANAGE"); // Can participate/register/manage club tournament activity
        memberMap.put("members", "VIEW");       // Can view member list/roster
        memberMap.put("matches", "MANAGE");     // Can view/score matches
        memberMap.put("attendance", "VIEW");    // Can view personal attendance
        memberMap.put("leaderboard", "VIEW");   // Can view rankings & leaderboard
        memberMap.put("posts", "VIEW");         // Feed & gallery viewer
        memberMap.put("inventory", "VIEW");     // View equipment inventory
        memberMap.put("finances", "NONE");      // No access to finances
        memberMap.put("analytics", "VIEW");     // View team statistics/analytics
        memberMap.put("settings", "NONE");      // No access to club configuration
        matrix.put("MEMBER", memberMap);

        return matrix;
    }

    private ClubRolePermissionResponse mapToResponse(ClubRolePermission entity) {
        return new ClubRolePermissionResponse(
                entity.getPermissionUuid(),
                entity.getOrganizationUuid(),
                entity.getRole(),
                entity.getModuleId(),
                entity.getAccessLevel()
        );
    }
}
