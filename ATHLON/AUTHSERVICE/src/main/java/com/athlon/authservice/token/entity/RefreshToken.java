package com.athlon.authservice.token.entity;

import java.time.LocalDateTime;
import java.util.Objects;
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
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "refresh_tokenid", updatable = false, nullable = false)
    private Long refreshTokenId;

    @Column(name = "refresh_tokenuuid", updatable = false, nullable = false, unique = true)
    private UUID refreshTokenUuid;

    @Column(name = "credentials_id", nullable = false)
    private Long credentialsId;

    @Column(name = "credentials_uuid", nullable =false)
    private UUID credentialsUuid;

    @Column(name = "token", nullable = false, unique = true, length = 500)
    private String token;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @Column(name = "revoked")
    private Integer revoked = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public RefreshToken() {
    }

    public RefreshToken(Long credentialsId,
                        UUID credentialsUuid,
                        String token,
                        LocalDateTime expiryDate) {

        this.credentialsId = credentialsId;
        this.credentialsUuid = credentialsUuid;
        this.token = token;
        this.expiryDate = expiryDate;
        this.revoked = 0;
    }

    @PrePersist
    public void prePersist() {

        if (refreshTokenUuid == null) {
            refreshTokenUuid = UUID.randomUUID();
        }

        if (revoked == null) {
            revoked = 0;
        }
    }

    public Long getRefreshTokenId() {
        return refreshTokenId;
    }

    public void setRefreshTokenId(Long refreshTokenId) {
        this.refreshTokenId = refreshTokenId;
    }

    public UUID getRefreshTokenUuid() {
        return refreshTokenUuid;
    }

    public void setRefreshTokenUuid(UUID refreshTokenUuid) {
        this.refreshTokenUuid = refreshTokenUuid;
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

    public boolean isRevoked() {
        return revoked != null && revoked == 1;
    }

    public void setRevoked(boolean revoked) {
        this.revoked = revoked ? 1 : 0;
    }

    public Integer getRevoked() {
        return revoked;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RefreshToken)) return false;
        RefreshToken that = (RefreshToken) o;
        return Objects.equals(refreshTokenId, that.refreshTokenId)
                && Objects.equals(refreshTokenUuid, that.refreshTokenUuid)
                && Objects.equals(token, that.token);
    }

    @Override
    public int hashCode() {
        return Objects.hash(refreshTokenId, refreshTokenUuid, token);
    }

    @Override
    public String toString() {
        return "RefreshToken{" +
                "refreshTokenId=" + refreshTokenId +
                ", refreshTokenUuid=" + refreshTokenUuid +
                ", credentialsId=" + credentialsId +
                ", credentialsUuid=" + credentialsUuid +
                ", token='" + token + '\'' +
                ", expiryDate=" + expiryDate +
                ", revoked=" + revoked +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}