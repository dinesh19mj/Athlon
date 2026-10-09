package com.athlon.identityservice.admin.controller;

import com.athlon.identityservice.admin.dto.AdminStatusUpdateRequest;
import com.athlon.identityservice.admin.dto.AdminUserResponse;
import com.athlon.identityservice.admin.service.AdminUserService;
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
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> getUsers(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) Integer status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AdminUserResponse> result = adminUserService.getUsers(search, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", result));
    }

    @GetMapping("/{userUuid}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserDetail(@PathVariable("userUuid") UUID userUuid) {
        AdminUserResponse response = adminUserService.getUserDetail(userUuid);
        return ResponseEntity.ok(ApiResponse.success("User detail retrieved successfully", response));
    }

    @PutMapping("/{userUuid}/status")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserStatus(
            @PathVariable("userUuid") UUID userUuid,
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
        AdminUserResponse response = adminUserService.updateUserStatus(
                userUuid,
                newStatus,
                request.getReason(),
                adminUserId,
                adminUserUuid,
                "admin@athlon.co.in",
                servletRequest.getRemoteAddr()
        );

        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", response));
    }
}
