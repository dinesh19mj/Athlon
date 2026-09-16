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
import com.athlon.identityservice.organization.dto.request.SaveRolePermissionsRequest;
import com.athlon.identityservice.organization.dto.response.ClubRolePermissionResponse;
import com.athlon.identityservice.organization.service.ClubPermissionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/club/permissions")
public class ClubPermissionController {

    private final ClubPermissionService permissionService;

    public ClubPermissionController(ClubPermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<ClubRolePermissionResponse>>> getOrganizationPermissions(
            @PathVariable("organizationUuid") UUID organizationUuid) {

        List<ClubRolePermissionResponse> list = permissionService.getPermissionsForOrganization(organizationUuid);
        return ResponseEntity.ok(ApiResponse.success("Club permissions retrieved successfully", list));
    }

    @GetMapping("/org/{organizationUuid}/role")
    public ResponseEntity<ApiResponse<List<ClubRolePermissionResponse>>> getPermissionsForRole(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam("role") String role) {

        List<ClubRolePermissionResponse> list = permissionService.getPermissionsForRole(organizationUuid, role);
        return ResponseEntity.ok(ApiResponse.success("Club role permissions retrieved successfully", list));
    }

    @PostMapping("/org/{organizationUuid}/save")
    public ResponseEntity<ApiResponse<List<ClubRolePermissionResponse>>> savePermissions(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @Valid @RequestBody SaveRolePermissionsRequest request) {

        List<ClubRolePermissionResponse> updated = permissionService.savePermissions(organizationUuid, request);
        return ResponseEntity.ok(ApiResponse.success("Club permissions updated successfully", updated));
    }

    @PostMapping("/org/{organizationUuid}/reset")
    public ResponseEntity<ApiResponse<List<ClubRolePermissionResponse>>> resetPermissions(
            @PathVariable("organizationUuid") UUID organizationUuid) {

        List<ClubRolePermissionResponse> defaults = permissionService.resetPermissionsToDefault(organizationUuid);
        return ResponseEntity.ok(ApiResponse.success("Club permissions reset to defaults successfully", defaults));
    }
}
