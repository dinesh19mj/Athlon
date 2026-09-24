package com.athlon.identityservice.community.entity;

import java.time.LocalDateTime;
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
@Table(name = "community_announcements")
public class CommunityAnnouncement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "announcement_id", updatable = false, nullable = false)
    private Long announcementId;

    @Column(name = "announcement_uuid", updatable = false, nullable = false, unique = true)
    private UUID announcementUuid;

    @Column(name = "community_uuid", nullable = false)
    private UUID communityUuid;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "created_by_user_uuid", nullable = false)
    private UUID createdByUserUuid;

    @Column(name = "created_by_user_name", length = 150)
    private String createdByUserName;

    @Column(name = "created_by_user_avatar", length = 500)
    private String createdByUserAvatar;

    @Column(name = "is_pinned", nullable = false)
    private Boolean isPinned = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CommunityAnnouncement() {
    }

    @PrePersist
    public void prePersist() {
        if (announcementUuid == null) {
            announcementUuid = UUID.randomUUID();
        }
        if (isPinned == null) isPinned = false;
    }

    public Long getAnnouncementId() {
        return announcementId;
    }

    public void setAnnouncementId(Long announcementId) {
        this.announcementId = announcementId;
    }

    public UUID getAnnouncementUuid() {
        return announcementUuid;
    }

    public void setAnnouncementUuid(UUID announcementUuid) {
        this.announcementUuid = announcementUuid;
    }

    public UUID getCommunityUuid() {
        return communityUuid;
    }

    public void setCommunityUuid(UUID communityUuid) {
        this.communityUuid = communityUuid;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public UUID getCreatedByUserUuid() {
        return createdByUserUuid;
    }

    public void setCreatedByUserUuid(UUID createdByUserUuid) {
        this.createdByUserUuid = createdByUserUuid;
    }

    public String getCreatedByUserName() {
        return createdByUserName;
    }

    public void setCreatedByUserName(String createdByUserName) {
        this.createdByUserName = createdByUserName;
    }

    public String getCreatedByUserAvatar() {
        return createdByUserAvatar;
    }

    public void setCreatedByUserAvatar(String createdByUserAvatar) {
        this.createdByUserAvatar = createdByUserAvatar;
    }

    public Boolean getIsPinned() {
        return isPinned;
    }

    public void setIsPinned(Boolean isPinned) {
        this.isPinned = isPinned;
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
