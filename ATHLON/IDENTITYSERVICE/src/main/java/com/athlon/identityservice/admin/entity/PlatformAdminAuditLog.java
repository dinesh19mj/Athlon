package com.athlon.identityservice.admin.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "platform_admin_audit_logs")
public class PlatformAdminAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_id", updatable = false, nullable = false)
    private Long auditId;

    @Column(name = "audit_uuid", updatable = false, nullable = false, unique = true)
    private UUID auditUuid = UUID.randomUUID();

    @Column(name = "admin_user_id", nullable = false)
    private Long adminUserId;

    @Column(name = "admin_user_uuid", nullable = false)
    private UUID adminUserUuid;

    @Column(name = "admin_email", nullable = false, length = 255)
    private String adminEmail;

    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType;

    @Column(name = "entity_id", nullable = false, length = 100)
    private String entityId;

    @Column(name = "previous_state", columnDefinition = "jsonb")
    private String previousState;

    @Column(name = "new_state", columnDefinition = "jsonb")
    private String newState;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "request_ip", length = 64)
    private String requestIp;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public PlatformAdminAuditLog() {
    }

    public PlatformAdminAuditLog(Long adminUserId,
                                 UUID adminUserUuid,
                                 String adminEmail,
                                 String action,
                                 String entityType,
                                 String entityId,
                                 String previousState,
                                 String newState,
                                 String reason,
                                 String requestIp) {
        this.auditUuid = UUID.randomUUID();
        this.adminUserId = adminUserId;
        this.adminUserUuid = adminUserUuid;
        this.adminEmail = adminEmail;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.previousState = previousState;
        this.newState = newState;
        this.reason = reason;
        this.requestIp = requestIp;
    }

    @PrePersist
    protected void onCreate() {
        if (this.auditUuid == null) {
            this.auditUuid = UUID.randomUUID();
        }
    }

    public Long getAuditId() {
        return auditId;
    }

    public void setAuditId(Long auditId) {
        this.auditId = auditId;
    }

    public UUID getAuditUuid() {
        return auditUuid;
    }

    public void setAuditUuid(UUID auditUuid) {
        this.auditUuid = auditUuid;
    }

    public Long getAdminUserId() {
        return adminUserId;
    }

    public void setAdminUserId(Long adminUserId) {
        this.adminUserId = adminUserId;
    }

    public UUID getAdminUserUuid() {
        return adminUserUuid;
    }

    public void setAdminUserUuid(UUID adminUserUuid) {
        this.adminUserUuid = adminUserUuid;
    }

    public String getAdminEmail() {
        return adminEmail;
    }

    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getPreviousState() {
        return previousState;
    }

    public void setPreviousState(String previousState) {
        this.previousState = previousState;
    }

    public String getNewState() {
        return newState;
    }

    public void setNewState(String newState) {
        this.newState = newState;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getRequestIp() {
        return requestIp;
    }

    public void setRequestIp(String requestIp) {
        this.requestIp = requestIp;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
