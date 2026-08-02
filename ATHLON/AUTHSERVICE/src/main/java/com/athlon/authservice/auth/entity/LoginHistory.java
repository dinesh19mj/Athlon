package com.athlon.authservice.auth.entity;

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
@Table(name = "login_history")
public class LoginHistory {

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

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "login_status", nullable = false, length = 50)
    private String loginStatus;

    @Column(name = "login_time", nullable = false)
    private LocalDateTime loginTime;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public LoginHistory() {
    }

    public LoginHistory(Long credentialsId, UUID credentialsUuid, String ipAddress, String userAgent, String loginStatus) {
        this.credentialsId = credentialsId;
        this.credentialsUuid = credentialsUuid;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.loginStatus = loginStatus;
        this.loginTime = LocalDateTime.now();
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

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getLoginStatus() {
        return loginStatus;
    }

    public void setLoginStatus(String loginStatus) {
        this.loginStatus = loginStatus;
    }

    public LocalDateTime getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(LocalDateTime loginTime) {
        this.loginTime = loginTime;
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
        LoginHistory that = (LoginHistory) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(uuid, that.uuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uuid);
    }

    @Override
    public String toString() {
        return "LoginHistory{" +
                "id=" + id +
                ", uuid=" + uuid +
                ", credentialsId=" + credentialsId +
                ", credentialsUuid=" + credentialsUuid +
                ", ipAddress='" + ipAddress + '\'' +
                ", userAgent='" + userAgent + '\'' +
                ", loginStatus='" + loginStatus + '\'' +
                ", loginTime=" + loginTime +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
