package com.athlon.identityservice.admin.controller;

import com.athlon.identityservice.admin.entity.PlatformAdminAuditLog;
import com.athlon.identityservice.admin.service.AdminAuditService;
import com.athlon.identityservice.dto.response.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/audit-logs")
public class AdminAuditLogController {

    private final AdminAuditService adminAuditService;

    public AdminAuditLogController(AdminAuditService adminAuditService) {
        this.adminAuditService = adminAuditService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PlatformAdminAuditLog>>> getLogs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<PlatformAdminAuditLog> logs = adminAuditService.getLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success("Platform audit logs retrieved successfully", logs));
    }
}
