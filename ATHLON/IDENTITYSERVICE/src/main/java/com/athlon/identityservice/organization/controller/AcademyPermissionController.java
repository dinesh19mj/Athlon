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
import com.athlon.identityservice.organization.dto.response.AcademyRolePermissionResponse;
import com.athlon.identityservice.organization.service.AcademyPermissionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/academy/permissions")
public class AcademyPermissionController {

    private final AcademyPermissionService permissionService;

    public AcademyPermissionController(AcademyPermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<AcademyRolePermissionResponse>>> getOrganizationPermissions(
            @PathVariable("organizationUuid") UUID organizationUuid) {

        List<AcademyRolePermissionResponse> list = permissionService.getPermissionsForOrganization(organizationUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy permissions retrieved successfully", list));
    }

    @GetMapping("/org/{organizationUuid}/role")
    public ResponseEntity<ApiResponse<List<AcademyRolePermissionResponse>>> getPermissionsForRole(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam("role") String role) {

        List<AcademyRolePermissionResponse> list = permissionService.getPermissionsForRole(organizationUuid, role);
        return ResponseEntity.ok(ApiResponse.success("Academy role permissions retrieved successfully", list));
    }

    @PostMapping("/org/{organizationUuid}/save")
    public ResponseEntity<ApiResponse<List<AcademyRolePermissionResponse>>> savePermissions(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @Valid @RequestBody SaveRolePermissionsRequest request) {

        List<AcademyRolePermissionResponse> updated = permissionService.savePermissions(organizationUuid, request);
        return ResponseEntity.ok(ApiResponse.success("Academy permissions updated successfully", updated));
    }

    @PostMapping("/org/{organizationUuid}/reset")
    public ResponseEntity<ApiResponse<List<AcademyRolePermissionResponse>>> resetPermissions(
            @PathVariable("organizationUuid") UUID organizationUuid) {

        List<AcademyRolePermissionResponse> resetList = permissionService.resetPermissionsToDefault(organizationUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy permissions reset to defaults successfully", resetList));
    }
}
