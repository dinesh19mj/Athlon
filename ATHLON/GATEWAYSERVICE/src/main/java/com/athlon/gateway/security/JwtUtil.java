package com.athlon.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    private final JwtProperties jwtProperties;

    public JwtUtil(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public String extractUserId(String token) {
        return extractClaim(token, claims -> {
            Object id = claims.get("userId");
            return id != null ? String.valueOf(id) : null;
        });
    }

    public String extractUserUuid(String token) {
        return extractClaim(token, claims -> {
            String uuid = claims.get("userUuid", String.class);
            return (uuid != null && !uuid.isBlank()) ? uuid : claims.getSubject();
        });
    }

    public String extractEmail(String token) {
        return extractClaim(token, claims -> claims.get("email", String.class));
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        String secret = (jwtProperties != null && jwtProperties.getSecret() != null && !jwtProperties.getSecret().isBlank())
                ? jwtProperties.getSecret()
                : "3b7d2eaf8c1d4f8e9a5c6b7d8e9f0a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8";
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
            if (keyBytes.length < 32) {
                keyBytes = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            keyBytes = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            logger.debug("JWT token validation failed: {}", e.getMessage());
            return false;
        }
    }
}
