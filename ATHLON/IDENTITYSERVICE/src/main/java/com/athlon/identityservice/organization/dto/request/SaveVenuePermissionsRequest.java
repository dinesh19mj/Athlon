package com.athlon.identityservice.organization.dto.request;

import java.util.List;

public class SaveVenuePermissionsRequest {

    private List<PermissionEntry> permissions;

    public SaveVenuePermissionsRequest() {
    }

    public List<PermissionEntry> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<PermissionEntry> permissions) {
        this.permissions = permissions;
    }

    public static class PermissionEntry {
        private String role;
        private String moduleId;
        private String accessLevel; // MANAGE, VIEW, NONE

        public PermissionEntry() {
        }

        public PermissionEntry(String role, String moduleId, String accessLevel) {
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
