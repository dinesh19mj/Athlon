package com.athlon.authservice.token.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "uuid", updatable = false, nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "credentials_id", nullable = false)
    private Long credentialsId;

    @Column(name = "credentials_uuid", nullable = false)
    private UUID credentialsUuid;

    @Column(name = "token", nullable = false, unique = true, length = 500)
    private String token;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @Column(name = "used", nullable = false)
    private boolean used;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public PasswordResetToken() {
    }

    public PasswordResetToken(Long credentialsId, UUID credentialsUuid, String token, LocalDateTime expiryDate) {
        this.credentialsId = credentialsId;
        this.credentialsUuid = credentialsUuid;
        this.token = token;
        this.expiryDate = expiryDate;
        this.used = false;
    }

    @PrePersist
    protected void onCreate() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public Long getCredentialsId() {
        return credentialsId;
    }

    public void setCredentialsId(Long credentialsId) {
        this.credentialsId = credentialsId;
    }

    public UUID getCredentialsUuid() {
        return credentialsUuid;
    }

    public void setCredentialsUuid(UUID credentialsUuid) {
        this.credentialsUuid = credentialsUuid;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public boolean isUsed() {
        return used;
    }

    public void setUsed(boolean used) {
        this.used = used;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PasswordResetToken that = (PasswordResetToken) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(uuid, that.uuid) &&
                Objects.equals(token, that.token);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uuid, token);
    }

    @Override
    public String toString() {
        return "PasswordResetToken{" +
                "id=" + id +
                ", uuid=" + uuid +
                ", credentialsId=" + credentialsId +
                ", credentialsUuid=" + credentialsUuid +
                ", token='" + token + '\'' +
                ", expiryDate=" + expiryDate +
                ", used=" + used +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
