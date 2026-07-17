package com.athlon.gateway.security;

import java.util.Objects;
import java.util.UUID;

public class CurrentUser {

    private UUID userUuid;
    private String email;
    private String role;

    public CurrentUser(UUID userUuid, String email, String role) {
        this.userUuid = userUuid;
        this.email = email;
        this.role = role;
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(UUID userUuid) {
        this.userUuid = userUuid;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CurrentUser that = (CurrentUser) o;
        return Objects.equals(userUuid, that.userUuid) &&
                Objects.equals(email, that.email) &&
                Objects.equals(role, that.role);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userUuid, email, role);
    }

    @Override
    public String toString() {
        return "CurrentUser{" +
                "userUuid=" + userUuid +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
}
