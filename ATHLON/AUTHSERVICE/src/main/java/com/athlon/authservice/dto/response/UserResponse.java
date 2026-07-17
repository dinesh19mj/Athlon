package com.athlon.authservice.dto.response;

import java.util.UUID;

public class UserResponse {
    private UUID id;
    private String email;
    private boolean isEmailVerified;

    public UserResponse() {}

    public UserResponse(UUID id, String email, boolean isEmailVerified) {
        this.id = id;
        this.email = email;
        this.isEmailVerified = isEmailVerified;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isEmailVerified() { return isEmailVerified; }
    public void setEmailVerified(boolean emailVerified) { isEmailVerified = emailVerified; }
}
