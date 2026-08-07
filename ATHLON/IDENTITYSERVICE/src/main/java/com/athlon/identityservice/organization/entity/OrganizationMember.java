package com.athlon.identityservice.organization.entity;

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
@Table(name = "organization_members")
public class OrganizationMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "organizationmemberid", updatable = false, nullable = false)
    private Long organizationMemberId;

    @Column(name = "organizationmemberuuid", updatable = false, nullable = false, unique = true)
    private UUID organizationMemberUuid;

    @Column(name = "organizationid", nullable = false)
    private Long organizationId;

    @Column(name = "organizationuuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "userid", nullable = false)
    private Long userId;

    @Column(name = "useruuid", nullable = false)
    private UUID userUuid;

    @Column(name = "role", nullable = false, length = 100)
    private String role;

    @Column(name = "isactive")
    private Integer isActive = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    public OrganizationMember() {
    }

    public OrganizationMember(Long organizationId,
                              UUID organizationUuid,
                              Long userId,
                              UUID userUuid,
                              String role,
                              Long createdBy) {

        this.organizationId = organizationId;
        this.organizationUuid = organizationUuid;
        this.userId = userId;
        this.userUuid = userUuid;
        this.role = role != null ? role : "MEMBER";
        this.createdBy = createdBy;
        this.isActive = 1;
    }

    @PrePersist
    public void prePersist() {

        if (organizationMemberUuid == null) {
            organizationMemberUuid = UUID.randomUUID();
        }

        if (isActive == null) {
            isActive = 1;
        }
    }

    public Long getOrganizationMemberId() {
        return organizationMemberId;
    }

    public void setOrganizationMemberId(Long organizationMemberId) {
        this.organizationMemberId = organizationMemberId;
    }

    public UUID getOrganizationMemberUuid() {
        return organizationMemberUuid;
    }

    public void setOrganizationMemberUuid(UUID organizationMemberUuid) {
        this.organizationMemberUuid = organizationMemberUuid;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }

    public boolean isActive() {
        return isActive != null && isActive == 1;
    }

    public void setActive(boolean active) {
        this.isActive = active ? 1 : 0;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
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
        if (!(o instanceof OrganizationMember)) return false;
        OrganizationMember that = (OrganizationMember) o;
        return Objects.equals(organizationMemberId, that.organizationMemberId)
                && Objects.equals(organizationMemberUuid, that.organizationMemberUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(organizationMemberId, organizationMemberUuid);
    }

    @Override
    public String toString() {
        return "OrganizationMember{" +
                "organizationMemberId=" + organizationMemberId +
                ", organizationMemberUuid=" + organizationMemberUuid +
                ", organizationId=" + organizationId +
                ", organizationUuid=" + organizationUuid +
                ", userId=" + userId +
                ", userUuid=" + userUuid +
                ", role='" + role + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}