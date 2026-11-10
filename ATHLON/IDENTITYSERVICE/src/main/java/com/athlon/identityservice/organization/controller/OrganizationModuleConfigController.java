package com.athlon.identityservice.organization.controller;

import com.athlon.identityservice.admin.dto.OrganizationModuleConfigDto;
import com.athlon.identityservice.admin.service.OrganizationModuleService;
import com.athlon.identityservice.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/identity/config/organization-modules")
public class OrganizationModuleConfigController {

    private final OrganizationModuleService moduleService;

    public OrganizationModuleConfigController(OrganizationModuleService moduleService) {
        this.moduleService = moduleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrganizationModuleConfigDto>>> getPublicModules() {
        List<OrganizationModuleConfigDto> modules = moduleService.getPublicModules();
        return ResponseEntity.ok(ApiResponse.success("Organization modules retrieved successfully", modules));
    }

    @GetMapping("/{moduleKey}")
    public ResponseEntity<ApiResponse<OrganizationModuleConfigDto>> getModuleByKey(@PathVariable("moduleKey") String moduleKey) {
        OrganizationModuleConfigDto module = moduleService.getModuleByKey(moduleKey);
        return ResponseEntity.ok(ApiResponse.success("Organization module retrieved successfully", module));
    }
}

