package com.athlon.authservice.security;

import com.athlon.authservice.util.JwtUtil;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class JwtTokenProvider {

    private final JwtUtil jwtUtil;

    public JwtTokenProvider(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public String generateToken(String email, UUID userId) {
        return jwtUtil.generateAccessToken(email, userId);
    }

    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }

    public String getUsernameFromToken(String token) {
        return jwtUtil.getEmailFromToken(token);
    }
}
