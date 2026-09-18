package com.athlon.authservice.service;

import com.athlon.authservice.security.JwtTokenProvider;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class JwtService {
    private final JwtTokenProvider tokenProvider;

    public JwtService(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    public String generateAccessToken(String email, UUID userUuid) {
        return tokenProvider.generateToken(email, userUuid);
    }

    public String generateAccessToken(String email, Long userId, UUID userUuid) {
        return tokenProvider.generateToken(email, userId, userUuid);
    }
}
