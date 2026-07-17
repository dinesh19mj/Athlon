package com.athlon.identityservice.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class AssignRoleRequest {

    @NotNull(message = "User UUID is required")
    private UUID userUuid;

    @NotNull(message = "Role UUID is required")
    private UUID roleUuid;

    public AssignRoleRequest() {
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(UUID userUuid) {
        this.userUuid = userUuid;
    }

    public UUID getRoleUuid() {
        return roleUuid;
    }

    public void setRoleUuid(UUID roleUuid) {
        this.roleUuid = roleUuid;
    }
}
