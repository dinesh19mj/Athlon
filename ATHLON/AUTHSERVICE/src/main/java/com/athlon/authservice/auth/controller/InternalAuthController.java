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

    @PostMapping("/credentials")
    public ResponseEntity<ApiResponse<Void>> createCredential(@Valid @RequestBody CreateCredentialRequest request) {
        authService.createCredential(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Credential created successfully", null));
    }
}
