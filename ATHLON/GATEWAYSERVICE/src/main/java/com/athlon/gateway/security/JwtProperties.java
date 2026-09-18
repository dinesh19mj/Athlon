package com.athlon.gateway.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Objects;

@Configuration
@ConfigurationProperties(prefix = "athlon.jwt")
public class JwtProperties {

    @org.springframework.beans.factory.annotation.Value("${athlon.jwt.secret:3b7d2eaf8c1d4f8e9a5c6b7d8e9f0a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8}")
    private String secret = "3b7d2eaf8c1d4f8e9a5c6b7d8e9f0a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8";

    @org.springframework.beans.factory.annotation.Value("${athlon.jwt.access-token-expiry:900000}")
    private long expirationMs = 900000L;

    public JwtProperties() {
    }

    public String getSecret() {
        return secret != null && !secret.isBlank() ? secret : "3b7d2eaf8c1d4f8e9a5c6b7d8e9f0a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8";
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    public void setExpirationMs(long expirationMs) {
        this.expirationMs = expirationMs;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        JwtProperties that = (JwtProperties) o;
        return expirationMs == that.expirationMs &&
                Objects.equals(secret, that.secret);
    }

    @Override
    public int hashCode() {
        return Objects.hash(secret, expirationMs);
    }

    @Override
    public String toString() {
        return "JwtProperties{" +
                "secret='***'" +
                ", expirationMs=" + expirationMs +
                '}';
    }
}
