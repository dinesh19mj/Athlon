package com.athlon.identityservice.dto.request;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public class AssignPermissionRequest {

    @NotNull(message = "Role UUID is required")
    private UUID roleUuid;

    @NotNull(message = "Permission UUID is required")
    private UUID permissionUuid;

    public AssignPermissionRequest() {
    }

    public UUID getRoleUuid() {
        return roleUuid;
    }

    public void setRoleUuid(UUID roleUuid) {
        this.roleUuid = roleUuid;
    }

    public UUID getPermissionUuid() {
        return permissionUuid;
    }

    public void setPermissionUuid(UUID permissionUuid) {
        this.permissionUuid = permissionUuid;
    }
}
