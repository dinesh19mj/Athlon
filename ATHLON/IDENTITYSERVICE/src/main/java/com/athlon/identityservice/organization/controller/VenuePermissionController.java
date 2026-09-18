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
import com.athlon.identityservice.organization.dto.request.SaveVenuePermissionsRequest;
import com.athlon.identityservice.organization.dto.response.VenueRolePermissionResponse;
import com.athlon.identityservice.organization.service.VenuePermissionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/venue/permissions")
public class VenuePermissionController {

    private final VenuePermissionService permissionService;

    public VenuePermissionController(VenuePermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<VenueRolePermissionResponse>>> getPermissionsForOrg(
            @PathVariable("organizationUuid") UUID organizationUuid) {

        List<VenueRolePermissionResponse> list = permissionService.getPermissionsForOrganization(organizationUuid);
        return ResponseEntity.ok(ApiResponse.success("Venue permissions retrieved successfully", list));
    }

    @GetMapping("/org/{organizationUuid}/role")
    public ResponseEntity<ApiResponse<List<VenueRolePermissionResponse>>> getPermissionsForRole(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam("role") String role) {

        List<VenueRolePermissionResponse> list = permissionService.getPermissionsForRole(organizationUuid, role);
        return ResponseEntity.ok(ApiResponse.success("Role permissions retrieved successfully", list));
    }

    @PostMapping("/org/{organizationUuid}/save")
    public ResponseEntity<ApiResponse<List<VenueRolePermissionResponse>>> savePermissions(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @Valid @RequestBody SaveVenuePermissionsRequest request) {

        List<VenueRolePermissionResponse> list = permissionService.savePermissions(organizationUuid, request);
        return ResponseEntity.ok(ApiResponse.success("Venue permissions saved successfully", list));
    }

    @PostMapping("/org/{organizationUuid}/reset")
    public ResponseEntity<ApiResponse<List<VenueRolePermissionResponse>>> resetPermissions(
            @PathVariable("organizationUuid") UUID organizationUuid) {

        List<VenueRolePermissionResponse> list = permissionService.resetPermissionsToDefault(organizationUuid);
        return ResponseEntity.ok(ApiResponse.success("Venue permissions reset to defaults successfully", list));
    }
}
