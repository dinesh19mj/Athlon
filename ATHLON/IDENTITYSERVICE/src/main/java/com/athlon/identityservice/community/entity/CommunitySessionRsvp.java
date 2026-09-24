package com.athlon.identityservice.community.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.athlon.identityservice.community.enums.SessionRsvpStatus;

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
@Table(name = "community_session_rsvps", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"session_uuid", "user_uuid"})
})
public class CommunitySessionRsvp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rsvp_id", updatable = false, nullable = false)
    private Long rsvpId;

    @Column(name = "session_uuid", nullable = false)
    private UUID sessionUuid;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name", length = 150)
    private String userName;

    @Column(name = "user_avatar", length = 500)
    private String userAvatar;

    @Enumerated(EnumType.STRING)
    @Column(name = "rsvp_status", nullable = false, length = 30)
    private SessionRsvpStatus rsvpStatus = SessionRsvpStatus.GOING;

    @Column(name = "guest_count", nullable = false)
    private Integer guestCount = 0;

    @Column(name = "notes", length = 255)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CommunitySessionRsvp() {
    }

    @PrePersist
    public void prePersist() {
        if (rsvpStatus == null) rsvpStatus = SessionRsvpStatus.GOING;
        if (guestCount == null) guestCount = 0;
    }

    public Long getRsvpId() {
        return rsvpId;
    }

    public void setRsvpId(Long rsvpId) {
        this.rsvpId = rsvpId;
    }

    public UUID getSessionUuid() {
        return sessionUuid;
    }

    public void setSessionUuid(UUID sessionUuid) {
        this.sessionUuid = sessionUuid;
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

    public String getUserAvatar() {
        return userAvatar;
    }

    public void setUserAvatar(String userAvatar) {
        this.userAvatar = userAvatar;
    }

    public SessionRsvpStatus getRsvpStatus() {
        return rsvpStatus;
    }

    public void setRsvpStatus(SessionRsvpStatus rsvpStatus) {
        this.rsvpStatus = rsvpStatus;
    }

    public Integer getGuestCount() {
        return guestCount;
    }

    public void setGuestCount(Integer guestCount) {
        this.guestCount = guestCount;
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
