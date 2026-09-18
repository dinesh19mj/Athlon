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
        byte[] keyBytes;
        try {
            keyBytes = io.jsonwebtoken.io.Decoders.BASE64.decode(jwtProperties.getSecret());
            if (keyBytes.length < 32) {
                keyBytes = jwtProperties.getSecret().getBytes(java.nio.charset.StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            keyBytes = jwtProperties.getSecret().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(String email, UUID userId) {
        return generateAccessToken(email, userId, "USER");
    }

    public String generateAccessToken(String email, UUID userId, String role) {
        return Jwts.builder()
                .setSubject(userId != null ? userId.toString() : "")
                .claim("userUuid", userId != null ? userId.toString() : "")
                .claim("userId", userId != null ? userId.toString() : "")
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
