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
@Table(name = "email_verification_tokens")
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "verification_tokenid", updatable = false, nullable = false)
    private Long verificationTokenId;

    @Column(name = "verification_tokenuuid", updatable = false, nullable = false, unique = true)
    private UUID verificationTokenUuid;

    @Column(name = "credentials_id", nullable = false)
    private Long credentialsId;

    @Column(name = "credentials_uuid", nullable = false)
    private UUID credentialsUuid;

    @Column(name = "token", nullable = false, unique = true, length = 500)
    private String token;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public EmailVerificationToken() {
    }

    public EmailVerificationToken(Long credentialsId,
                                  UUID credentialsUuid,
                                  String token,
                                  LocalDateTime expiryDate) {
        this.credentialsId = credentialsId;
        this.credentialsUuid = credentialsUuid;
        this.token = token;
        this.expiryDate = expiryDate;
    }

    @PrePersist
    public void prePersist() {
        if (verificationTokenUuid == null) {
            verificationTokenUuid = UUID.randomUUID();
        }
    }

    public Long getVerificationTokenId() {
        return verificationTokenId;
    }

    public void setVerificationTokenId(Long verificationTokenId) {
        this.verificationTokenId = verificationTokenId;
    }

    public UUID getVerificationTokenUuid() {
        return verificationTokenUuid;
    }

    public void setVerificationTokenUuid(UUID verificationTokenUuid) {
        this.verificationTokenUuid = verificationTokenUuid;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof EmailVerificationToken)) return false;
        EmailVerificationToken that = (EmailVerificationToken) o;
        return Objects.equals(verificationTokenId, that.verificationTokenId)
                && Objects.equals(verificationTokenUuid, that.verificationTokenUuid)
                && Objects.equals(token, that.token);
    }

    @Override
    public int hashCode() {
        return Objects.hash(verificationTokenId, verificationTokenUuid, token);
    }

    @Override
    public String toString() {
        return "EmailVerificationToken{" +
                "verificationTokenId=" + verificationTokenId +
                ", verificationTokenUuid=" + verificationTokenUuid +
                ", credentialsId=" + credentialsId +
                ", credentialsUuid=" + credentialsUuid +
                ", token='" + token + '\'' +
                ", expiryDate=" + expiryDate +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
