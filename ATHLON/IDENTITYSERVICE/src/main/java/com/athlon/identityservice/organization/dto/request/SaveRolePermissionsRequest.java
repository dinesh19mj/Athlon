package com.athlon.identityservice.organization.dto.request;

import java.util.List;

public class SaveRolePermissionsRequest {

    private List<RolePermissionItem> permissions;

    public SaveRolePermissionsRequest() {
    }

    public SaveRolePermissionsRequest(List<RolePermissionItem> permissions) {
        this.permissions = permissions;
    }

    public List<RolePermissionItem> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<RolePermissionItem> permissions) {
        this.permissions = permissions;
    }

    public static class RolePermissionItem {
        private String role;        // COACH, STAFF, STUDENT, PARENT, ADMIN
        private String moduleId;    // batches, schedule, attendance, students, etc.
        private String accessLevel; // MANAGE, VIEW, NONE

        public RolePermissionItem() {
        }

        public RolePermissionItem(String role, String moduleId, String accessLevel) {
            this.role = role;
            this.moduleId = moduleId;
            this.accessLevel = accessLevel;
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
}
