package com.athlon.identityservice.security.controller;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.security.dto.request.CreateRoleRequest;
import com.athlon.identityservice.security.dto.response.RoleResponse;
import com.athlon.identityservice.security.service.RoleService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(@Valid @RequestBody CreateRoleRequest request) {
        Long currentUserId = 1L;
        RoleResponse response = roleService.createRole(request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Role created successfully", response));
    }

    @PostMapping("/delete/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable UUID uuid) {
        Long currentUserId = 1L;
        roleService.deleteRole(uuid, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Role deleted successfully", null));
    }

    @GetMapping("/get/{uuid}")
    public ResponseEntity<ApiResponse<RoleResponse>> getRoleByUuid(@PathVariable UUID uuid) {
        RoleResponse response = roleService.getRoleByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/get-all")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles() {
        List<RoleResponse> responses = roleService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
