package com.athlon.identityservice.organization.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "club_post_comments")
public class ClubPostComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id", updatable = false, nullable = false)
    private Long commentId;

    @Column(name = "comment_uuid", updatable = false, nullable = false, unique = true)
    private UUID commentUuid;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "post_uuid", nullable = false)
    private UUID postUuid;

    @Column(name = "organization_uuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "author_user_id")
    private Long authorUserId;

    @Column(name = "author_user_uuid", nullable = false)
    private UUID authorUserUuid;

    @Column(name = "author_name", nullable = false, length = 150)
    private String authorName;

    @Column(name = "author_role", nullable = false, length = 50)
    private String authorRole; // ADMIN, COACH, MEMBER

    @Column(name = "author_avatar", length = 500)
    private String authorAvatar;

    @Column(name = "comment_text", nullable = false, columnDefinition = "TEXT")
    private String commentText;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ClubPostComment() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.commentUuid == null) {
            this.commentUuid = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getCommentId() {
        return commentId;
    }

    public void setCommentId(Long commentId) {
        this.commentId = commentId;
    }

    public UUID getCommentUuid() {
        return commentUuid;
    }

    public void setCommentUuid(UUID commentUuid) {
        this.commentUuid = commentUuid;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public UUID getPostUuid() {
        return postUuid;
    }

    public void setPostUuid(UUID postUuid) {
        this.postUuid = postUuid;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public Long getAuthorUserId() {
        return authorUserId;
    }

    public void setAuthorUserId(Long authorUserId) {
        this.authorUserId = authorUserId;
    }

    public UUID getAuthorUserUuid() {
        return authorUserUuid;
    }

    public void setAuthorUserUuid(UUID authorUserUuid) {
        this.authorUserUuid = authorUserUuid;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getAuthorRole() {
        return authorRole;
    }

    public void setAuthorRole(String authorRole) {
        this.authorRole = authorRole;
    }

    public String getAuthorAvatar() {
        return authorAvatar;
    }

    public void setAuthorAvatar(String authorAvatar) {
        this.authorAvatar = authorAvatar;
    }

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
