package com.athlon.identityservice.security.controller;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.security.dto.request.CreatePermissionRequest;
import com.athlon.identityservice.security.dto.response.PermissionResponse;
import com.athlon.identityservice.security.service.PermissionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<PermissionResponse>> createPermission(@Valid @RequestBody CreatePermissionRequest request) {
        Long currentUserId = 1L;
        PermissionResponse response = permissionService.createPermission(request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Permission created successfully", response));
    }

    @GetMapping("/get-all")
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> getAllPermissions() {
        List<PermissionResponse> responses = permissionService.getAllPermissions();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
