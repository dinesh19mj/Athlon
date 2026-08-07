package com.athlon.authservice.auth.dto.response;

import java.util.UUID;

public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private Long userId;
    private UUID userUuid;

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
}
