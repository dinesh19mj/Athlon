package com.athlon.identityservice.security.entity;

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
@Table(name = "user_roles")
public class UserRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userroleid", updatable = false, nullable = false)
    private Long id;

    @Column(name = "userroleuuid", updatable = false, nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "userid", nullable = false)
    private Long userId;

    @Column(name = "useruuid", nullable = false)
    private UUID userUuid;

    @Column(name = "roleid", nullable = false)
    private Long roleId;

    @Column(name = "roleuuid", nullable = false)
    private UUID roleUuid;

    @Column(name = "isactive", nullable = false)
    private boolean isActive;

    @Column(name = "createdon", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "modifiedon")
    private LocalDateTime updatedAt;

    @Column(name = "createdby")
    private Long createdBy;

    @Column(name = "modifiedby")
    private Long updatedBy;

    public UserRole() {
    }

    public UserRole(Long userId, UUID userUuid, Long roleId, UUID roleUuid, Long createdBy) {
        this.userId = userId;
        this.userUuid = userUuid;
        this.roleId = roleId;
        this.roleUuid = roleUuid;
        this.isActive = true;
        this.createdBy = createdBy;
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(UUID userUuid) {
        this.userUuid = userUuid;
    }

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    public UUID getRoleUuid() {
        return roleUuid;
    }

    public void setRoleUuid(UUID roleUuid) {
        this.roleUuid = roleUuid;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
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

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserRole userRole = (UserRole) o;
        return Objects.equals(id, userRole.id) &&
                Objects.equals(uuid, userRole.uuid) &&
                Objects.equals(userId, userRole.userId) &&
                Objects.equals(roleId, userRole.roleId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uuid, userId, roleId);
    }

    @Override
    public String toString() {
        return "UserRole{" +
                "id=" + id +
                ", uuid=" + uuid +
                ", userId=" + userId +
                ", roleId=" + roleId +
                ", isActive=" + isActive +
                '}';
    }
}
