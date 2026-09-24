package com.athlon.identityservice.community.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "community_post_comments")
public class CommunityPostComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id", updatable = false, nullable = false)
    private Long commentId;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "author_user_uuid", nullable = false)
    private UUID authorUserUuid;

    @Column(name = "author_name", length = 150)
    private String authorName;

    @Column(name = "author_avatar", length = 500)
    private String authorAvatar;

    @Column(name = "comment_text", nullable = false, columnDefinition = "TEXT")
    private String commentText;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public CommunityPostComment() {
    }

    public CommunityPostComment(Long postId, UUID authorUserUuid, String authorName, String authorAvatar, String commentText) {
        this.postId = postId;
        this.authorUserUuid = authorUserUuid;
        this.authorName = authorName;
        this.authorAvatar = authorAvatar;
        this.commentText = commentText;
    }

    public Long getCommentId() {
        return commentId;
    }

    public void setCommentId(Long commentId) {
        this.commentId = commentId;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
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
