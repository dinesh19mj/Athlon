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

import com.athlon.identityservice.organization.dto.request.SaveOrganizerPermissionsRequest;
import com.athlon.identityservice.organization.dto.response.OrganizerRolePermissionResponse;
import com.athlon.identityservice.organization.entity.OrganizerRolePermission;
import com.athlon.identityservice.organization.repository.OrganizerRolePermissionRepository;

@Service
public class OrganizerPermissionService {

    private final OrganizerRolePermissionRepository permissionRepository;

    public static final List<String> ORGANIZER_MODULES = Arrays.asList(
            "tournaments", "registrations", "matches", "scoring", "inventory", "finances", "livestream", "officials", "settings"
    );

    public static final List<String> ORGANIZER_ROLES = Arrays.asList(
            "ADMIN", "TOURNAMENT_DIRECTOR", "CHIEF_UMPIRE", "DESK_OFFICIAL", "FINANCE_OFFICER", "LOGISTICS_COORDINATOR", "MEDIA_MANAGER"
    );

    public OrganizerPermissionService(OrganizerRolePermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    public List<OrganizerRolePermissionResponse> getPermissionsForOrganization(UUID organizationUuid) {
        List<OrganizerRolePermission> existing = permissionRepository.findByOrganizationUuid(organizationUuid);
        if (existing.isEmpty()) {
            return generateDefaultPermissions(organizationUuid);
        }
        return existing.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<OrganizerRolePermissionResponse> getPermissionsForRole(UUID organizationUuid, String role) {
        String normalizedRole = role != null ? role.toUpperCase() : "TOURNAMENT_DIRECTOR";
        List<OrganizerRolePermission> existing = permissionRepository.findByOrganizationUuidAndRole(organizationUuid, normalizedRole);
        if (existing.isEmpty()) {
            return generateDefaultPermissions(organizationUuid).stream()
                    .filter(p -> p.getRole().equalsIgnoreCase(normalizedRole))
                    .collect(Collectors.toList());
        }
        return existing.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<OrganizerRolePermissionResponse> savePermissions(UUID organizationUuid, SaveOrganizerPermissionsRequest request) {
        if (request == null || request.getPermissions() == null || request.getPermissions().isEmpty()) {
            return getPermissionsForOrganization(organizationUuid);
        }

        List<OrganizerRolePermission> toSave = new ArrayList<>();
        for (SaveOrganizerPermissionsRequest.RolePermissionItem item : request.getPermissions()) {
            if (item.getRole() == null || item.getModuleId() == null) {
                continue;
            }

            String role = item.getRole().toUpperCase();
            String moduleId = item.getModuleId().toLowerCase();
            String accessLevel = item.getAccessLevel() != null ? item.getAccessLevel().toUpperCase() : "VIEW";

            Optional<OrganizerRolePermission> existingOpt = permissionRepository
                    .findByOrganizationUuidAndRoleAndModuleId(organizationUuid, role, moduleId);

            OrganizerRolePermission entity;
            if (existingOpt.isPresent()) {
                entity = existingOpt.get();
                entity.setAccessLevel(accessLevel);
            } else {
                entity = new OrganizerRolePermission(organizationUuid, role, moduleId, accessLevel);
            }
            toSave.add(entity);
        }

        List<OrganizerRolePermission> saved = permissionRepository.saveAll(toSave);
        return saved.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<OrganizerRolePermissionResponse> resetPermissionsToDefault(UUID organizationUuid) {
        permissionRepository.deleteByOrganizationUuid(organizationUuid);
        List<OrganizerRolePermissionResponse> defaults = generateDefaultPermissions(organizationUuid);
        List<OrganizerRolePermission> entities = defaults.stream()
                .map(d -> new OrganizerRolePermission(organizationUuid, d.getRole(), d.getModuleId(), d.getAccessLevel()))
                .collect(Collectors.toList());
        List<OrganizerRolePermission> saved = permissionRepository.saveAll(entities);
        return saved.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private List<OrganizerRolePermissionResponse> generateDefaultPermissions(UUID organizationUuid) {
        List<OrganizerRolePermissionResponse> defaults = new ArrayList<>();
        Map<String, Map<String, String>> defaultMatrix = getOrganizerDefaultMatrix();

        for (String role : ORGANIZER_ROLES) {
            Map<String, String> moduleMap = defaultMatrix.getOrDefault(role, new HashMap<>());
            for (String moduleId : ORGANIZER_MODULES) {
                String level = moduleMap.getOrDefault(moduleId, role.equals("ADMIN") ? "MANAGE" : "VIEW");
                defaults.add(new OrganizerRolePermissionResponse(
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

    public static Map<String, Map<String, String>> getOrganizerDefaultMatrix() {
        Map<String, Map<String, String>> matrix = new HashMap<>();

        // 1. ADMIN: Complete access
        Map<String, String> adminMap = new HashMap<>();
        for (String mod : ORGANIZER_MODULES) {
            adminMap.put(mod, "MANAGE");
        }
        matrix.put("ADMIN", adminMap);

        // 2. TOURNAMENT_DIRECTOR: Broad operational control over tournament lifecycle
        Map<String, String> tdMap = new HashMap<>();
        tdMap.put("tournaments", "MANAGE");
        tdMap.put("registrations", "MANAGE");
        tdMap.put("matches", "MANAGE");
        tdMap.put("scoring", "MANAGE");
        tdMap.put("inventory", "MANAGE");
        tdMap.put("finances", "VIEW");
        tdMap.put("livestream", "MANAGE");
        tdMap.put("officials", "VIEW");
        tdMap.put("settings", "VIEW");
        matrix.put("TOURNAMENT_DIRECTOR", tdMap);

        // 3. CHIEF_UMPIRE: Technical fixture, schedule, refereeing & court matches
        Map<String, String> umpireMap = new HashMap<>();
        umpireMap.put("tournaments", "VIEW");
        umpireMap.put("registrations", "VIEW");
        umpireMap.put("matches", "MANAGE");
        umpireMap.put("scoring", "MANAGE");
        umpireMap.put("inventory", "VIEW");
        umpireMap.put("finances", "NONE");
        umpireMap.put("livestream", "VIEW");
        umpireMap.put("officials", "NONE");
        umpireMap.put("settings", "NONE");
        matrix.put("CHIEF_UMPIRE", umpireMap);

        // 4. DESK_OFFICIAL: Player registration desk, check-ins, line scoring
        Map<String, String> deskMap = new HashMap<>();
        deskMap.put("tournaments", "VIEW");
        deskMap.put("registrations", "MANAGE");
        deskMap.put("matches", "VIEW");
        deskMap.put("scoring", "MANAGE");
        deskMap.put("inventory", "VIEW");
        deskMap.put("finances", "NONE");
        deskMap.put("livestream", "NONE");
        deskMap.put("officials", "NONE");
        deskMap.put("settings", "NONE");
        matrix.put("DESK_OFFICIAL", deskMap);

        // 5. FINANCE_OFFICER: Treasury, fees, ticket collections & sponsorships
        Map<String, String> finMap = new HashMap<>();
        finMap.put("tournaments", "VIEW");
        finMap.put("registrations", "VIEW");
        finMap.put("matches", "NONE");
        finMap.put("scoring", "NONE");
        finMap.put("inventory", "VIEW");
        finMap.put("finances", "MANAGE");
        finMap.put("livestream", "NONE");
        finMap.put("officials", "NONE");
        finMap.put("settings", "NONE");
        matrix.put("FINANCE_OFFICER", finMap);

        // 6. LOGISTICS_COORDINATOR: Equipment, shuttles, balls, court banners, medals
        Map<String, String> logMap = new HashMap<>();
        logMap.put("tournaments", "VIEW");
        logMap.put("registrations", "VIEW");
        logMap.put("matches", "VIEW");
        logMap.put("scoring", "NONE");
        logMap.put("inventory", "MANAGE");
        logMap.put("finances", "VIEW");
        logMap.put("livestream", "VIEW");
        logMap.put("officials", "NONE");
        logMap.put("settings", "NONE");
        matrix.put("LOGISTICS_COORDINATOR", logMap);

        // 7. MEDIA_MANAGER: Livestreams, marketing, banners, media production
        Map<String, String> mediaMap = new HashMap<>();
        mediaMap.put("tournaments", "VIEW");
        mediaMap.put("registrations", "NONE");
        mediaMap.put("matches", "VIEW");
        mediaMap.put("scoring", "VIEW");
        mediaMap.put("inventory", "VIEW");
        mediaMap.put("finances", "NONE");
        mediaMap.put("livestream", "MANAGE");
        mediaMap.put("officials", "NONE");
        mediaMap.put("settings", "NONE");
        matrix.put("MEDIA_MANAGER", mediaMap);

        return matrix;
    }

    private OrganizerRolePermissionResponse mapToResponse(OrganizerRolePermission entity) {
        return new OrganizerRolePermissionResponse(
                entity.getPermissionUuid(),
                entity.getOrganizationUuid(),
                entity.getRole(),
                entity.getModuleId(),
                entity.getAccessLevel()
        );
    }
}
