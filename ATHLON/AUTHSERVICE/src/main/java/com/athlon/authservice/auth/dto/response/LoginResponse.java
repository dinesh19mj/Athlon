package com.athlon.authservice.auth.dto.response;

import java.util.UUID;

public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private Long userId;
    private UUID userUuid;
    private String role;
    private java.util.List<String> platformRoles;

    public LoginResponse() {
    }

    public LoginResponse(String accessToken,
                         String refreshToken,
                         Long userId,
                         UUID userUuid) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.userUuid = userUuid;
        this.role = "USER";
        this.platformRoles = java.util.Collections.emptyList();
    }

    public LoginResponse(String accessToken,
                         String refreshToken,
                         Long userId,
                         UUID userUuid,
                         String role,
                         java.util.List<String> platformRoles) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.userUuid = userUuid;
        this.role = role != null ? role : "USER";
        this.platformRoles = platformRoles != null ? platformRoles : java.util.Collections.emptyList();
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(UUID userUuid) {
        this.userUuid = userUuid;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public java.util.List<String> getPlatformRoles() {
        return platformRoles;
    }

    public void setPlatformRoles(java.util.List<String> platformRoles) {
        this.platformRoles = platformRoles;
    }
}
