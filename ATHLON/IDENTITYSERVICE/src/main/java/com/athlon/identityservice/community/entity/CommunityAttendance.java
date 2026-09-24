package com.athlon.identityservice.community.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.athlon.identityservice.community.enums.SessionAttendanceStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "community_attendances", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"session_uuid", "user_uuid"})
})
public class CommunityAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id", updatable = false, nullable = false)
    private Long attendanceId;

    @Column(name = "session_uuid", nullable = false)
    private UUID sessionUuid;

    @Column(name = "community_uuid", nullable = false)
    private UUID communityUuid;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name", length = 150)
    private String userName;

    @Enumerated(EnumType.STRING)
    @Column(name = "attendance_status", nullable = false, length = 30)
    private SessionAttendanceStatus attendanceStatus = SessionAttendanceStatus.PRESENT;

    @Column(name = "marked_by_user_uuid")
    private UUID markedByUserUuid;

    @Column(name = "notes", length = 255)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CommunityAttendance() {
    }

    @PrePersist
    public void prePersist() {
        if (attendanceStatus == null) attendanceStatus = SessionAttendanceStatus.PRESENT;
    }

    public Long getAttendanceId() {
        return attendanceId;
    }

    public void setAttendanceId(Long attendanceId) {
        this.attendanceId = attendanceId;
    }

    public UUID getSessionUuid() {
        return sessionUuid;
    }

    public void setSessionUuid(UUID sessionUuid) {
        this.sessionUuid = sessionUuid;
    }

    public UUID getCommunityUuid() {
        return communityUuid;
    }

    public void setCommunityUuid(UUID communityUuid) {
        this.communityUuid = communityUuid;
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

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public SessionAttendanceStatus getAttendanceStatus() {
        return attendanceStatus;
    }

    public void setAttendanceStatus(SessionAttendanceStatus attendanceStatus) {
        this.attendanceStatus = attendanceStatus;
    }

    public UUID getMarkedByUserUuid() {
        return markedByUserUuid;
    }

    public void setMarkedByUserUuid(UUID markedByUserUuid) {
        this.markedByUserUuid = markedByUserUuid;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
}
