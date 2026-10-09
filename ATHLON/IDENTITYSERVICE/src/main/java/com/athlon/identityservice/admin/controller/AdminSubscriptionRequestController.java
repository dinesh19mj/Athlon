package com.athlon.identityservice.admin.controller;

import com.athlon.identityservice.admin.dto.AdminStatusUpdateRequest;
import com.athlon.identityservice.admin.entity.PlatformSubscriptionRequest;
import com.athlon.identityservice.admin.service.AdminSubscriptionRequestService;
import com.athlon.identityservice.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/subscriptions/requests")
public class AdminSubscriptionRequestController {

    private final AdminSubscriptionRequestService requestService;

    public AdminSubscriptionRequestController(AdminSubscriptionRequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PlatformSubscriptionRequest>>> getRequests(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<PlatformSubscriptionRequest> result = requestService.getRequests(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Subscription requests retrieved successfully", result));
    }

    @PostMapping("/{requestUuid}/approve")
    public ResponseEntity<ApiResponse<PlatformSubscriptionRequest>> approveRequest(
            @PathVariable("requestUuid") UUID requestUuid,
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

        PlatformSubscriptionRequest result = requestService.approveRequest(
                requestUuid,
                adminUserId,
                adminUserUuid,
                "admin@athlon.co.in",
                servletRequest.getRemoteAddr()
        );
        return ResponseEntity.ok(ApiResponse.success("Subscription request approved and entitlement activated", result));
    }

    @PostMapping("/{requestUuid}/reject")
    public ResponseEntity<ApiResponse<PlatformSubscriptionRequest>> rejectRequest(
            @PathVariable("requestUuid") UUID requestUuid,
            @RequestBody(required = false) AdminStatusUpdateRequest body,
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

        String reason = body != null && body.getReason() != null ? body.getReason() : "Payment verification failed or invalid details provided";
        PlatformSubscriptionRequest result = requestService.rejectRequest(
                requestUuid,
                reason,
                adminUserId,
                adminUserUuid,
                "admin@athlon.co.in",
                servletRequest.getRemoteAddr()
        );
        return ResponseEntity.ok(ApiResponse.success("Subscription request rejected", result));
    }
}
