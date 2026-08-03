package com.athlon.authservice.auth.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "credentials")
public class Credentials {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "credentialid", updatable = false, nullable = false)
    private Long credentialId;

    @Column(name = "credentialuuid", updatable = false, nullable = false, unique = true)
    private UUID credentialUuid;

    @Column(name = "useruuid", nullable = false)
    private UUID userUuid;

    @Column(name = "email", unique = true, length = 255)
    private String email;

    @Column(name = "phone", unique = true, length = 20)
    private String phone;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "is_email_verified")
    private Integer isEmailVerified = 0;

    @Column(name = "is_account_locked")
    private Integer isAccountLocked = 0;

    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (credentialUuid == null) {
            credentialUuid = UUID.randomUUID();
        }

        if (isEmailVerified == null) {
            isEmailVerified = 0;
        }

        if (isAccountLocked == null) {
            isAccountLocked = 0;
        }

        if (failedLoginAttempts == null) {
            failedLoginAttempts = 0;
        }
    }

    public Long getCredentialId() {
        return credentialId;
    }

    public void setCredentialId(Long credentialId) {
        this.credentialId = credentialId;
    }

    public UUID getCredentialUuid() {
        return credentialUuid;
    }

    public void setCredentialUuid(UUID credentialUuid) {
        this.credentialUuid = credentialUuid;
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public boolean isEmailVerified() {
        return isEmailVerified != null && isEmailVerified == 1;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.isEmailVerified = emailVerified ? 1 : 0;
    }

    public Integer getIsEmailVerified() {
        return isEmailVerified;
    }

    public boolean isAccountLocked() {
        return isAccountLocked != null && isAccountLocked == 1;
    }

    public void setAccountLocked(boolean accountLocked) {
        this.isAccountLocked = accountLocked ? 1 : 0;
    }

    public Integer getIsAccountLocked() {
        return isAccountLocked;
    }

    public Integer getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(Integer failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}