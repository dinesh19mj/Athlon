package com.athlon.identityservice.organization.dto.response;

import java.util.UUID;

public class OrganizerRolePermissionResponse {

    private UUID permissionUuid;
    private UUID organizationUuid;
    private String role;
    private String moduleId;
    private String accessLevel;

    public OrganizerRolePermissionResponse() {
    }

    public OrganizerRolePermissionResponse(UUID permissionUuid, UUID organizationUuid, String role, String moduleId, String accessLevel) {
        this.permissionUuid = permissionUuid;
        this.organizationUuid = organizationUuid;
        this.role = role;
        this.moduleId = moduleId;
        this.accessLevel = accessLevel;
    }

    public UUID getPermissionUuid() {
        return permissionUuid;
    }

    public void setPermissionUuid(UUID permissionUuid) {
        this.permissionUuid = permissionUuid;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getModuleId() {
        return moduleId;
    }

    public void setModuleId(String moduleId) {
        this.moduleId = moduleId;
    }

    public String getAccessLevel() {
        return accessLevel;
    }

    public void setAccessLevel(String accessLevel) {
        this.accessLevel = accessLevel;
    }
}
