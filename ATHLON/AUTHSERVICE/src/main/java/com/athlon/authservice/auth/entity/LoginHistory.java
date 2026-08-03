package com.athlon.authservice.auth.entity;

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
@Table(name = "login_history")
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "login_historyid", updatable = false, nullable = false)
    private Long loginHistoryId;

    @Column(name = "login_historyuuid", updatable = false, nullable = false, unique = true)
    private UUID loginHistoryUuid;

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

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public LoginHistory() {
    }

    public LoginHistory(Long credentialsId, UUID credentialsUuid,
                        String ipAddress, String userAgent,
                        String loginStatus) {

        this.credentialsId = credentialsId;
        this.credentialsUuid = credentialsUuid;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.loginStatus = loginStatus;
        this.loginTime = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {

        if (loginHistoryUuid == null) {
            loginHistoryUuid = UUID.randomUUID();
        }

        if (loginTime == null) {
            loginTime = LocalDateTime.now();
        }
    }

    public Long getLoginHistoryId() {
        return loginHistoryId;
    }

    public void setLoginHistoryId(Long loginHistoryId) {
        this.loginHistoryId = loginHistoryId;
    }

    public UUID getLoginHistoryUuid() {
        return loginHistoryUuid;
    }

    public void setLoginHistoryUuid(UUID loginHistoryUuid) {
        this.loginHistoryUuid = loginHistoryUuid;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof LoginHistory)) return false;
        LoginHistory that = (LoginHistory) o;
        return Objects.equals(loginHistoryId, that.loginHistoryId)
                && Objects.equals(loginHistoryUuid, that.loginHistoryUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(loginHistoryId, loginHistoryUuid);
    }

    @Override
    public String toString() {
        return "LoginHistory{" +
                "loginHistoryId=" + loginHistoryId +
                ", loginHistoryUuid=" + loginHistoryUuid +
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