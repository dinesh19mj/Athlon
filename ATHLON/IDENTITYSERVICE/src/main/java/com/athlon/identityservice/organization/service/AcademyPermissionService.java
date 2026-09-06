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
import com.athlon.identityservice.organization.dto.response.AcademyRolePermissionResponse;
import com.athlon.identityservice.organization.entity.AcademyRolePermission;
import com.athlon.identityservice.organization.repository.AcademyRolePermissionRepository;

@Service
public class AcademyPermissionService {

    private final AcademyRolePermissionRepository permissionRepository;

    public static final List<String> ALL_MODULES = Arrays.asList(
            "batches", "schedule", "attendance", "students", "coaches",
            "performance", "posts", "tournaments", "matches", "inventory",
            "centres", "facilities", "staff", "finances", "settings"
    );

    public static final List<String> ALL_ROLES = Arrays.asList(
            "ADMIN", "COACH", "STAFF", "STUDENT", "PARENT"
    );

    public AcademyPermissionService(AcademyRolePermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    public List<AcademyRolePermissionResponse> getPermissionsForOrganization(UUID organizationUuid) {
        List<AcademyRolePermission> existing = permissionRepository.findByOrganizationUuid(organizationUuid);
        if (existing.isEmpty()) {
            return generateDefaultPermissions(organizationUuid);
        }
        return existing.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AcademyRolePermissionResponse> getPermissionsForRole(UUID organizationUuid, String role) {
        String normalizedRole = role != null ? role.toUpperCase() : "STUDENT";
        List<AcademyRolePermission> existing = permissionRepository.findByOrganizationUuidAndRole(organizationUuid, normalizedRole);
        if (existing.isEmpty()) {
            return generateDefaultPermissions(organizationUuid).stream()
                    .filter(p -> p.getRole().equalsIgnoreCase(normalizedRole))
                    .collect(Collectors.toList());
        }
        return existing.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<AcademyRolePermissionResponse> savePermissions(UUID organizationUuid, SaveRolePermissionsRequest request) {
        if (request == null || request.getPermissions() == null || request.getPermissions().isEmpty()) {
            return getPermissionsForOrganization(organizationUuid);
        }

        List<AcademyRolePermission> toSave = new ArrayList<>();
        for (SaveRolePermissionsRequest.RolePermissionItem item : request.getPermissions()) {
            if (item.getRole() == null || item.getModuleId() == null) {
                continue;
            }

            String role = item.getRole().toUpperCase();
            String moduleId = item.getModuleId().toLowerCase();
            String accessLevel = item.getAccessLevel() != null ? item.getAccessLevel().toUpperCase() : "VIEW";

            Optional<AcademyRolePermission> existingOpt = permissionRepository
                    .findByOrganizationUuidAndRoleAndModuleId(organizationUuid, role, moduleId);

            AcademyRolePermission entity;
            if (existingOpt.isPresent()) {
                entity = existingOpt.get();
                entity.setAccessLevel(accessLevel);
            } else {
                entity = new AcademyRolePermission(organizationUuid, role, moduleId, accessLevel);
            }
            toSave.add(entity);
        }

        List<AcademyRolePermission> saved = permissionRepository.saveAll(toSave);
        return saved.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<AcademyRolePermissionResponse> resetPermissionsToDefault(UUID organizationUuid) {
        permissionRepository.deleteByOrganizationUuid(organizationUuid);
        List<AcademyRolePermissionResponse> defaults = generateDefaultPermissions(organizationUuid);
        List<AcademyRolePermission> entities = defaults.stream()
                .map(d -> new AcademyRolePermission(organizationUuid, d.getRole(), d.getModuleId(), d.getAccessLevel()))
                .collect(Collectors.toList());
        List<AcademyRolePermission> saved = permissionRepository.saveAll(entities);
        return saved.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private List<AcademyRolePermissionResponse> generateDefaultPermissions(UUID organizationUuid) {
        List<AcademyRolePermissionResponse> defaults = new ArrayList<>();
        Map<String, Map<String, String>> defaultMatrix = getDefaultMatrix();

        for (String role : ALL_ROLES) {
            Map<String, String> moduleMap = defaultMatrix.getOrDefault(role, new HashMap<>());
            for (String moduleId : ALL_MODULES) {
                String level = moduleMap.getOrDefault(moduleId, role.equals("ADMIN") ? "MANAGE" : "VIEW");
                defaults.add(new AcademyRolePermissionResponse(
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

    private Map<String, Map<String, String>> getDefaultMatrix() {
        Map<String, Map<String, String>> matrix = new HashMap<>();

        // ADMIN
        Map<String, String> admin = new HashMap<>();
        ALL_MODULES.forEach(m -> admin.put(m, "MANAGE"));
        matrix.put("ADMIN", admin);

        // COACH
        Map<String, String> coach = new HashMap<>();
        coach.put("batches", "MANAGE");
        coach.put("schedule", "MANAGE");
        coach.put("attendance", "MANAGE");
        coach.put("students", "VIEW");
        coach.put("coaches", "VIEW");
        coach.put("performance", "MANAGE");
        coach.put("posts", "MANAGE");
        coach.put("tournaments", "MANAGE");
        coach.put("matches", "MANAGE");
        coach.put("inventory", "VIEW");
        coach.put("centres", "VIEW");
        coach.put("facilities", "VIEW");
        coach.put("staff", "NONE");
        coach.put("finances", "NONE");
        coach.put("settings", "NONE");
        matrix.put("COACH", coach);

        // STAFF
        Map<String, String> staff = new HashMap<>();
        staff.put("batches", "VIEW");
        staff.put("schedule", "VIEW");
        staff.put("attendance", "MANAGE");
        staff.put("students", "MANAGE");
        staff.put("coaches", "VIEW");
        staff.put("performance", "NONE");
        staff.put("posts", "MANAGE");
        staff.put("tournaments", "VIEW");
        staff.put("matches", "VIEW");
        staff.put("inventory", "MANAGE");
        staff.put("centres", "VIEW");
        staff.put("facilities", "MANAGE");
        staff.put("staff", "VIEW");
        staff.put("finances", "VIEW");
        staff.put("settings", "NONE");
        matrix.put("STAFF", staff);

        // STUDENT
        Map<String, String> student = new HashMap<>();
        student.put("batches", "VIEW");
        student.put("schedule", "VIEW");
        student.put("attendance", "VIEW");
        student.put("students", "NONE");
        student.put("coaches", "VIEW");
        student.put("performance", "VIEW");
        student.put("posts", "VIEW");
        student.put("tournaments", "MANAGE");
        student.put("matches", "MANAGE");
        student.put("inventory", "NONE");
        student.put("centres", "VIEW");
        student.put("facilities", "VIEW");
        student.put("staff", "NONE");
        student.put("finances", "VIEW");
        student.put("settings", "NONE");
        matrix.put("STUDENT", student);

        // PARENT
        Map<String, String> parent = new HashMap<>();
        parent.put("batches", "VIEW");
        parent.put("schedule", "VIEW");
        parent.put("attendance", "VIEW");
        parent.put("students", "VIEW");
        parent.put("coaches", "VIEW");
        parent.put("performance", "VIEW");
        parent.put("posts", "VIEW");
        parent.put("tournaments", "VIEW");
        parent.put("matches", "VIEW");
        parent.put("inventory", "NONE");
        parent.put("centres", "VIEW");
        parent.put("facilities", "VIEW");
        parent.put("staff", "NONE");
        parent.put("finances", "MANAGE");
        parent.put("settings", "NONE");
        matrix.put("PARENT", parent);

        return matrix;
    }

    private AcademyRolePermissionResponse mapToResponse(AcademyRolePermission entity) {
        return new AcademyRolePermissionResponse(
                entity.getPermissionUuid(),
                entity.getOrganizationUuid(),
                entity.getRole(),
                entity.getModuleId(),
                entity.getAccessLevel()
        );
    }
}
