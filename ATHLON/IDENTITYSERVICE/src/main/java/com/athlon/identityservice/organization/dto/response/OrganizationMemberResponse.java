package com.athlon.identityservice.organization.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public class OrganizationMemberResponse {

    private UUID organizationMemberUuid;
    private Long organizationMemberId;
    private UUID organizationUuid;
    private Long organizationId;
    private UUID userUuid;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String photo;
    private String role;
    private String status;
    private Integer isActive;
    private LocalDateTime joinedAt;

    public OrganizationMemberResponse() {
    }

    public UUID getOrganizationMemberUuid() {
        return organizationMemberUuid;
    }

    public void setOrganizationMemberUuid(UUID organizationMemberUuid) {
        this.organizationMemberUuid = organizationMemberUuid;
    }

    public Long getOrganizationMemberId() {
        return organizationMemberId;
    }

    public void setOrganizationMemberId(Long organizationMemberId) {
        this.organizationMemberId = organizationMemberId;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(UUID userUuid) {
        this.userUuid = userUuid;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
