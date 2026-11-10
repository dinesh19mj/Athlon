package com.athlon.identityservice.admin.controller;

import com.athlon.identityservice.admin.dto.CreateOrganizationModuleRequest;
import com.athlon.identityservice.admin.dto.OrganizationModuleConfigDto;
import com.athlon.identityservice.admin.dto.UpdateOrganizationModuleConfigRequest;
import com.athlon.identityservice.admin.service.OrganizationModuleService;
import com.athlon.identityservice.dto.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/organization-modules")
public class AdminOrganizationModuleController {

    private final OrganizationModuleService moduleService;

    public AdminOrganizationModuleController(OrganizationModuleService moduleService) {
        this.moduleService = moduleService;
    }

    private Long parseAdminId(String header) {
        if (header != null && !header.trim().isEmpty() && !"undefined".equalsIgnoreCase(header) && !"null".equalsIgnoreCase(header)) {
            try {
                return Long.parseLong(header.trim());
            } catch (Exception ignored) {}
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrganizationModuleConfigDto>>> getAllModules() {
        List<OrganizationModuleConfigDto> modules = moduleService.getAllModulesForAdmin();
        return ResponseEntity.ok(ApiResponse.success("All organization modules retrieved successfully", modules));
    }

    @GetMapping("/{moduleKey}")
    public ResponseEntity<ApiResponse<OrganizationModuleConfigDto>> getModuleDetail(@PathVariable("moduleKey") String moduleKey) {
        OrganizationModuleConfigDto module = moduleService.getModuleByKey(moduleKey);
        return ResponseEntity.ok(ApiResponse.success("Organization module retrieved successfully", module));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrganizationModuleConfigDto>> createModule(
            @Valid @RequestBody CreateOrganizationModuleRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String adminUserIdHeader) {

        Long adminId = parseAdminId(adminUserIdHeader);
        OrganizationModuleConfigDto created = moduleService.createModule(request, adminId);
        return ResponseEntity.ok(ApiResponse.success("Organization module created successfully", created));
    }

    @PutMapping("/{moduleKey}")
    public ResponseEntity<ApiResponse<OrganizationModuleConfigDto>> updateModule(
            @PathVariable("moduleKey") String moduleKey,
            @Valid @RequestBody UpdateOrganizationModuleConfigRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String adminUserIdHeader) {

        Long adminId = parseAdminId(adminUserIdHeader);
        OrganizationModuleConfigDto updated = moduleService.updateModule(moduleKey, request, adminId);
        return ResponseEntity.ok(ApiResponse.success("Organization module updated successfully", updated));
    }

    @PostMapping("/{moduleKey}/toggle")
    public ResponseEntity<ApiResponse<OrganizationModuleConfigDto>> toggleModule(
            @PathVariable("moduleKey") String moduleKey,
            @RequestHeader(value = "X-User-Id", required = false) String adminUserIdHeader) {

        Long adminId = parseAdminId(adminUserIdHeader);
        OrganizationModuleConfigDto toggled = moduleService.toggleModuleStatus(moduleKey, adminId);
        return ResponseEntity.ok(ApiResponse.success("Organization module status toggled successfully", toggled));
    }

    @DeleteMapping("/{moduleKey}")
    public ResponseEntity<ApiResponse<Void>> deleteModule(
            @PathVariable("moduleKey") String moduleKey,
            @RequestHeader(value = "X-User-Id", required = false) String adminUserIdHeader) {

        Long adminId = parseAdminId(adminUserIdHeader);
        moduleService.deleteModule(moduleKey, adminId);
        return ResponseEntity.ok(ApiResponse.success("Organization module deleted successfully", null));
    }

    @PostMapping("/reorder")
    public ResponseEntity<ApiResponse<List<OrganizationModuleConfigDto>>> reorderModules(
            @RequestBody List<String> moduleKeys) {

        moduleService.reorderModules(moduleKeys);
        List<OrganizationModuleConfigDto> reordered = moduleService.getAllModulesForAdmin();
        return ResponseEntity.ok(ApiResponse.success("Organization modules reordered successfully", reordered));
    }
}

