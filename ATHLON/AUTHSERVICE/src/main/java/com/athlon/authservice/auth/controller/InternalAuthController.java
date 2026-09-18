package com.athlon.authservice.auth.controller;

import com.athlon.authservice.auth.dto.request.CreateCredentialRequest;
import com.athlon.authservice.dto.response.ApiResponse;
import com.athlon.authservice.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/internal")
public class InternalAuthController {

    private final AuthService authService;

    public InternalAuthController(AuthService authService) {
        this.authService = authService;
    }

    @org.springframework.beans.factory.annotation.Value("${service.internal.key:athlon-internal-secure-key-2026}")
    private String expectedInternalKey;

    @PostMapping("/credentials")
    public ResponseEntity<ApiResponse<Void>> createCredential(
            @org.springframework.web.bind.annotation.RequestHeader(value = "X-Internal-Service-Key", required = false) String serviceKey,
            @Valid @RequestBody CreateCredentialRequest request) {
        if (expectedInternalKey != null && !expectedInternalKey.isEmpty()) {
            if (serviceKey == null || !expectedInternalKey.equals(serviceKey)) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>(false, "Unauthorized internal access", null));
            }
        }
        authService.createCredential(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Credential created successfully", null));
    }
}
