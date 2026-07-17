package com.athlon.identityservice.controller;

import com.athlon.identityservice.dto.request.CreateOrganizationRequest;
import com.athlon.identityservice.dto.request.UpdateOrganizationRequest;
import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.dto.response.OrganizationResponse;
import com.athlon.identityservice.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/identity/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<OrganizationResponse>> createOrganization(@Valid @RequestBody CreateOrganizationRequest request) {
        Long currentUserId = 1L;
        OrganizationResponse response = organizationService.createOrganization(request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Organization created successfully", response));
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<OrganizationResponse>> updateOrganization(@Valid @RequestBody UpdateOrganizationRequest request) {
        Long currentUserId = 1L;
        OrganizationResponse response = organizationService.updateOrganization(request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Organization updated successfully", response));
    }

    @PostMapping("/delete/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deleteOrganization(@PathVariable UUID uuid) {
        Long currentUserId = 1L;
        organizationService.deleteOrganization(uuid, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Organization deleted successfully", null));
    }

    @GetMapping("/get/{uuid}")
    public ResponseEntity<ApiResponse<OrganizationResponse>> getOrganizationByUuid(@PathVariable UUID uuid) {
        OrganizationResponse response = organizationService.getOrganizationByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/get-all")
    public ResponseEntity<ApiResponse<List<OrganizationResponse>>> getAllOrganizations() {
        List<OrganizationResponse> responses = organizationService.getAllOrganizations();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
