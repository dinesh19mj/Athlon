package com.athlon.authservice.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class CreateCredentialRequest {
    
    @NotNull(message = "User UUID is required")
    private UUID userUuid;

    private String email;

    private String phone;

    @NotBlank(message = "Password is required")
    private String password;

    public CreateCredentialRequest() {}

    public UUID getUserUuid() { return userUuid; }
    public void setUserUuid(UUID userUuid) { this.userUuid = userUuid; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
