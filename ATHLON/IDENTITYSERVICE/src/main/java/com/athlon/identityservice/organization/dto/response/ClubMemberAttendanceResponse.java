package com.athlon.identityservice.organization.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public class ClubMemberAttendanceResponse {

    private UUID organizationMemberUuid;
    private Long organizationMemberId;
    private UUID userUuid;
    private Long userId;
    private String fullName;
    private String photo;
    private String phone;
    private String role;
    
    private UUID attendanceUuid;
    private LocalDate attendanceDate;
    private String status; // PRESENT, ABSENT, LEAVE, UNMARKED
    private LocalTime checkInTime;
    private String notes;
    private LocalDateTime updatedAt;

    public ClubMemberAttendanceResponse() {
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

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public UUID getAttendanceUuid() {
        return attendanceUuid;
    }

    public void setAttendanceUuid(UUID attendanceUuid) {
        this.attendanceUuid = attendanceUuid;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
