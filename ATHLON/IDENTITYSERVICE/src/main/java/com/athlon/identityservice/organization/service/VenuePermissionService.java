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

import com.athlon.identityservice.organization.dto.request.SaveVenuePermissionsRequest;
import com.athlon.identityservice.organization.dto.response.VenueRolePermissionResponse;
import com.athlon.identityservice.organization.entity.VenueRolePermission;
import com.athlon.identityservice.organization.repository.VenueRolePermissionRepository;

@Service
public class VenuePermissionService {

    public static final List<String> VENUE_ROLES = Arrays.asList(
            "ADMIN",
            "VENUE_MANAGER",
            "FRONT_DESK",
            "COURT_SUPERVISOR",
            "FINANCE_MANAGER",
            "MAINTENANCE_STAFF"
    );

    public static final List<String> VENUE_MODULES = Arrays.asList(
            "courts",
            "calendar",
            "bookings",
            "blocks",
            "pricing",
            "finances",
            "inventory",
            "staff",
            "settings"
    );

    private final VenueRolePermissionRepository permissionRepository;

    public VenuePermissionService(VenueRolePermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    public List<VenueRolePermissionResponse> getPermissionsForOrganization(UUID organizationUuid) {
        List<VenueRolePermission> existing = permissionRepository.findByOrganizationUuid(organizationUuid);
        if (existing.isEmpty()) {
            return generateDefaultPermissions(organizationUuid);
        }
        return existing.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<VenueRolePermissionResponse> getPermissionsForRole(UUID organizationUuid, String role) {
        String normalizedRole = role != null ? role.toUpperCase() : "FRONT_DESK";
        List<VenueRolePermission> existing = permissionRepository.findByOrganizationUuidAndRole(organizationUuid, normalizedRole);
        if (existing.isEmpty()) {
            List<VenueRolePermissionResponse> allDefaults = generateDefaultPermissions(organizationUuid);
            return allDefaults.stream()
                    .filter(p -> p.getRole().equalsIgnoreCase(normalizedRole))
                    .collect(Collectors.toList());
        }
        return existing.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<VenueRolePermissionResponse> savePermissions(UUID organizationUuid, SaveVenuePermissionsRequest request) {
        if (request == null || request.getPermissions() == null) {
            throw new IllegalArgumentException("Permissions list cannot be null");
        }

        List<VenueRolePermission> toSave = new ArrayList<>();

        for (SaveVenuePermissionsRequest.PermissionEntry entry : request.getPermissions()) {
            if (entry.getRole() == null || entry.getModuleId() == null) continue;

            String role = entry.getRole().trim().toUpperCase();
            String moduleId = entry.getModuleId().trim().toLowerCase();
            String accessLevel = entry.getAccessLevel() != null ? entry.getAccessLevel().trim().toUpperCase() : "VIEW";

            Optional<VenueRolePermission> existingOpt = permissionRepository
                    .findByOrganizationUuidAndRoleAndModuleId(organizationUuid, role, moduleId);

            VenueRolePermission entity;
            if (existingOpt.isPresent()) {
                entity = existingOpt.get();
                entity.setAccessLevel(accessLevel);
            } else {
                entity = new VenueRolePermission(organizationUuid, role, moduleId, accessLevel);
            }
            toSave.add(entity);
        }

        List<VenueRolePermission> saved = permissionRepository.saveAll(toSave);
        return saved.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<VenueRolePermissionResponse> resetPermissionsToDefault(UUID organizationUuid) {
        permissionRepository.deleteByOrganizationUuid(organizationUuid);
        List<VenueRolePermissionResponse> defaults = generateDefaultPermissions(organizationUuid);
        List<VenueRolePermission> entities = defaults.stream()
                .map(d -> new VenueRolePermission(organizationUuid, d.getRole(), d.getModuleId(), d.getAccessLevel()))
                .collect(Collectors.toList());
        List<VenueRolePermission> saved = permissionRepository.saveAll(entities);
        return saved.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private List<VenueRolePermissionResponse> generateDefaultPermissions(UUID organizationUuid) {
        List<VenueRolePermissionResponse> defaults = new ArrayList<>();
        Map<String, Map<String, String>> defaultMatrix = getVenueDefaultMatrix();

        for (String role : VENUE_ROLES) {
            Map<String, String> moduleMap = defaultMatrix.getOrDefault(role, new HashMap<>());
            for (String moduleId : VENUE_MODULES) {
                String level = moduleMap.getOrDefault(moduleId, role.equals("ADMIN") ? "MANAGE" : "VIEW");
                defaults.add(new VenueRolePermissionResponse(
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

    public static Map<String, Map<String, String>> getVenueDefaultMatrix() {
        Map<String, Map<String, String>> matrix = new HashMap<>();

        // 1. ADMIN: Complete access across all venue operations
        Map<String, String> adminMap = new HashMap<>();
        for (String mod : VENUE_MODULES) {
            adminMap.put(mod, "MANAGE");
        }
        matrix.put("ADMIN", adminMap);

        // 2. VENUE_MANAGER: Broad operations & staff control
        Map<String, String> vmMap = new HashMap<>();
        vmMap.put("courts", "MANAGE");
        vmMap.put("calendar", "MANAGE");
        vmMap.put("bookings", "MANAGE");
        vmMap.put("blocks", "MANAGE");
        vmMap.put("pricing", "MANAGE");
        vmMap.put("finances", "MANAGE");
        vmMap.put("inventory", "MANAGE");
        vmMap.put("staff", "MANAGE");
        vmMap.put("settings", "VIEW");
        matrix.put("VENUE_MANAGER", vmMap);

        // 3. FRONT_DESK: Customer walk-in reservations, slot allocations & payments
        Map<String, String> fdMap = new HashMap<>();
        fdMap.put("courts", "VIEW");
        fdMap.put("calendar", "MANAGE");
        fdMap.put("bookings", "MANAGE");
        fdMap.put("blocks", "VIEW");
        fdMap.put("pricing", "VIEW");
        fdMap.put("finances", "VIEW");
        fdMap.put("inventory", "VIEW");
        fdMap.put("staff", "NONE");
        fdMap.put("settings", "NONE");
        matrix.put("FRONT_DESK", fdMap);

        // 4. COURT_SUPERVISOR: Court readiness, lighting, equipment handovers & blocks
        Map<String, String> csMap = new HashMap<>();
        csMap.put("courts", "VIEW");
        csMap.put("calendar", "VIEW");
        csMap.put("bookings", "VIEW");
        csMap.put("blocks", "MANAGE");
        csMap.put("pricing", "NONE");
        csMap.put("finances", "NONE");
        csMap.put("inventory", "MANAGE");
        csMap.put("staff", "NONE");
        csMap.put("settings", "NONE");
        matrix.put("COURT_SUPERVISOR", csMap);

        // 5. FINANCE_MANAGER: Accounts, receipts, price adjustments & audit
        Map<String, String> fmMap = new HashMap<>();
        fmMap.put("courts", "VIEW");
        fmMap.put("calendar", "VIEW");
        fmMap.put("bookings", "VIEW");
        fmMap.put("blocks", "NONE");
        fmMap.put("pricing", "MANAGE");
        fmMap.put("finances", "MANAGE");
        fmMap.put("inventory", "VIEW");
        fmMap.put("staff", "NONE");
        fmMap.put("settings", "NONE");
        matrix.put("FINANCE_MANAGER", fmMap);

        // 6. MAINTENANCE_STAFF: Court maintenance holds & equipment repairs
        Map<String, String> msMap = new HashMap<>();
        msMap.put("courts", "VIEW");
        msMap.put("calendar", "NONE");
        msMap.put("bookings", "NONE");
        msMap.put("blocks", "MANAGE");
        msMap.put("pricing", "NONE");
        msMap.put("finances", "NONE");
        msMap.put("inventory", "MANAGE");
        msMap.put("staff", "NONE");
        msMap.put("settings", "NONE");
        matrix.put("MAINTENANCE_STAFF", msMap);

        return matrix;
    }

    private VenueRolePermissionResponse mapToResponse(VenueRolePermission entity) {
        return new VenueRolePermissionResponse(
                entity.getPermissionUuid(),
                entity.getOrganizationUuid(),
                entity.getRole(),
                entity.getModuleId(),
                entity.getAccessLevel()
        );
    }
}
