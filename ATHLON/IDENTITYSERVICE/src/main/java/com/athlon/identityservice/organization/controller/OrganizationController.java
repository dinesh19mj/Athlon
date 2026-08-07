package com.athlon.identityservice.organization.controller;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.organization.dto.request.CreateOrganizationRequest;
import com.athlon.identityservice.organization.dto.request.UpdateOrganizationRequest;
import com.athlon.identityservice.organization.dto.response.OrganizationResponse;
import com.athlon.identityservice.organization.service.OrganizationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @PostMapping("/createOrganization")
    public ResponseEntity<ApiResponse<OrganizationResponse>> createOrganization(
            @Valid @RequestBody CreateOrganizationRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestHeader(value = "X-User-Uuid", defaultValue = "00000000-0000-0000-0000-000000000000") UUID userUuid) {
        
        OrganizationResponse response = organizationService.createOrganization(request, userId, userUuid);
        return ResponseEntity.ok(ApiResponse.success("Organization created successfully", response));
    }

    @PostMapping("/updateOrganization")
    public ResponseEntity<ApiResponse<OrganizationResponse>> updateOrganization(
            @Valid @RequestBody UpdateOrganizationRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        
        OrganizationResponse response = organizationService.updateOrganization(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Organization updated successfully", response));
    }

    @PostMapping("/deleteOrganization/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deleteOrganization(
            @PathVariable UUID uuid,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        
        organizationService.deleteOrganization(uuid, userId);
        return ResponseEntity.ok(ApiResponse.success("Organization deleted successfully", null));
    }

    @GetMapping("/getOrganizationByUuid/{uuid}")
    public ResponseEntity<ApiResponse<OrganizationResponse>> getOrganizationByUuid(@PathVariable("uuid") UUID uuid) {
        OrganizationResponse response = organizationService.getOrganizationByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/getAllOrganizations")
    public ResponseEntity<ApiResponse<List<OrganizationResponse>>> getAllOrganizations() {
        List<OrganizationResponse> responses = organizationService.getAllOrganizations();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/getByUserUuid/{userUuid}")
    public ResponseEntity<ApiResponse<List<OrganizationResponse>>> getOrganizationsByUserUuid(@PathVariable("userUuid") UUID userUuid) {
        List<OrganizationResponse> responses = organizationService.getOrganizationsByUserUuid(userUuid);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
