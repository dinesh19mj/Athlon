package com.athlon.identityservice.organization.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.organization.dto.request.SaveOrganizerPermissionsRequest;
import com.athlon.identityservice.organization.dto.response.OrganizerRolePermissionResponse;
import com.athlon.identityservice.organization.service.OrganizerPermissionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/organizer/permissions")
public class OrganizerPermissionController {

    private final OrganizerPermissionService permissionService;

    public OrganizerPermissionController(OrganizerPermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<OrganizerRolePermissionResponse>>> getPermissionsForOrg(
            @PathVariable("organizationUuid") UUID organizationUuid) {

        List<OrganizerRolePermissionResponse> list = permissionService.getPermissionsForOrganization(organizationUuid);
        return ResponseEntity.ok(ApiResponse.success("Organizer permissions retrieved successfully", list));
    }

    @GetMapping("/org/{organizationUuid}/role")
    public ResponseEntity<ApiResponse<List<OrganizerRolePermissionResponse>>> getPermissionsForRole(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam("role") String role) {

        List<OrganizerRolePermissionResponse> list = permissionService.getPermissionsForRole(organizationUuid, role);
        return ResponseEntity.ok(ApiResponse.success("Role permissions retrieved successfully", list));
    }

    @PostMapping("/org/{organizationUuid}/save")
    public ResponseEntity<ApiResponse<List<OrganizerRolePermissionResponse>>> savePermissions(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @Valid @RequestBody SaveOrganizerPermissionsRequest request) {

        List<OrganizerRolePermissionResponse> list = permissionService.savePermissions(organizationUuid, request);
        return ResponseEntity.ok(ApiResponse.success("Organizer permissions saved successfully", list));
    }

    @PostMapping("/org/{organizationUuid}/reset")
    public ResponseEntity<ApiResponse<List<OrganizerRolePermissionResponse>>> resetPermissions(
            @PathVariable("organizationUuid") UUID organizationUuid) {

        List<OrganizerRolePermissionResponse> list = permissionService.resetPermissionsToDefault(organizationUuid);
        return ResponseEntity.ok(ApiResponse.success("Organizer permissions reset to defaults", list));
    }
}
