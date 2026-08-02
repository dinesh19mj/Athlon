package com.athlon.authservice.auth.controller;

import com.athlon.authservice.auth.dto.request.LoginRequest;

import com.athlon.authservice.dto.response.ApiResponse;
import com.athlon.authservice.auth.dto.response.LoginResponse;
import com.athlon.authservice.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request,
            HttpServletRequest servletRequest) {
        String ipAddress = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");
        LoginResponse response = authService.login(request, ipAddress, userAgent);
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", response));
    }
}
