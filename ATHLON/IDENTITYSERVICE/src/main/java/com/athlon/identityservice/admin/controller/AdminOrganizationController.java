package com.athlon.identityservice.admin.controller;

import com.athlon.identityservice.admin.dto.AdminOrganizationResponse;
import com.athlon.identityservice.admin.dto.AdminStatusUpdateRequest;
import com.athlon.identityservice.admin.service.AdminOrganizationService;
import com.athlon.identityservice.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/organizations")
public class AdminOrganizationController {

    private final AdminOrganizationService adminOrganizationService;

    public AdminOrganizationController(AdminOrganizationService adminOrganizationService) {
        this.adminOrganizationService = adminOrganizationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminOrganizationResponse>>> getOrganizations(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "status", required = false) Integer status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AdminOrganizationResponse> result = adminOrganizationService.getOrganizations(search, type, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Organizations retrieved successfully", result));
    }

    @GetMapping("/{orgUuid}")
    public ResponseEntity<ApiResponse<AdminOrganizationResponse>> getOrganizationDetail(
            @PathVariable("orgUuid") UUID orgUuid) {
        AdminOrganizationResponse response = adminOrganizationService.getOrganizationDetail(orgUuid);
        return ResponseEntity.ok(ApiResponse.success("Organization detail retrieved successfully", response));
    }

    @PutMapping("/{orgUuid}/status")
    public ResponseEntity<ApiResponse<AdminOrganizationResponse>> updateOrganizationStatus(
            @PathVariable("orgUuid") UUID orgUuid,
            @Valid @RequestBody AdminStatusUpdateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String adminUserIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String adminUserUuidHeader,
            HttpServletRequest servletRequest) {

        Long adminUserId = null;
        UUID adminUserUuid = null;
        if (adminUserIdHeader != null) {
            try { adminUserId = Long.parseLong(adminUserIdHeader); } catch (Exception ignored) {}
        }
        if (adminUserUuidHeader != null) {
            try { adminUserUuid = UUID.fromString(adminUserUuidHeader); } catch (Exception ignored) {}
        }

        Integer newStatus = "ACTIVE".equalsIgnoreCase(request.getStatus()) || "1".equals(request.getStatus()) ? 1 : 0;
        AdminOrganizationResponse response = adminOrganizationService.updateOrganizationStatus(
                orgUuid,
                newStatus,
                request.getReason(),
                adminUserId,
                adminUserUuid,
                "admin@athlon.co.in",
                servletRequest.getRemoteAddr()
        );

        return ResponseEntity.ok(ApiResponse.success("Organization status updated successfully", response));
    }
}
