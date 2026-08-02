package com.athlon.authservice.token.dto.request;

public class VerifyEmailRequest {
    private String token;

    public VerifyEmailRequest() {}

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
