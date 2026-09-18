package com.athlon.authservice.util;

import com.athlon.authservice.security.JwtProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private final JwtProperties jwtProperties;

    public JwtUtil(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    private Key getSigningKey() {
        String secret = jwtProperties != null && jwtProperties.getSecret() != null && !jwtProperties.getSecret().isBlank()
                ? jwtProperties.getSecret()
                : "3b7d2eaf8c1d4f8e9a5c6b7d8e9f0a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e83b7d2eaf8c1d4f8e9a5c6b7d8e9f0a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8";
        byte[] keyBytes = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(String email, UUID userUuid) {
        return generateAccessToken(email, null, userUuid, "USER");
    }

    public String generateAccessToken(String email, Long userId, UUID userUuid) {
        return generateAccessToken(email, userId, userUuid, "USER");
    }

    public String generateAccessToken(String email, UUID userUuid, String role) {
        return generateAccessToken(email, null, userUuid, role);
    }

    public String generateAccessToken(String email, Long userId, UUID userUuid, String role) {
        return Jwts.builder()
                .setSubject(userUuid != null ? userUuid.toString() : "")
                .claim("userUuid", userUuid != null ? userUuid.toString() : "")
                .claim("userId", userId != null ? String.valueOf(userId) : (userUuid != null ? userUuid.toString() : ""))
                .claim("email", email != null ? email : "")
                .claim("role", role != null ? role : "USER")
                .setIssuer("athlon-auth")
                .setAudience("athlon-platform")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtProperties.getExpirationMs()))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getEmailFromToken(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                    .parseClaimsJws(token).getBody().get("email", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    public String getUserUuidFromToken(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                    .parseClaimsJws(token).getBody().getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
