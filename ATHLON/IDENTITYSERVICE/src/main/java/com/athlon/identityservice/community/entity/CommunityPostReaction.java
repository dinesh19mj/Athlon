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
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "community_post_reactions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"post_id", "user_uuid"})
})
public class CommunityPostReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reaction_id", updatable = false, nullable = false)
    private Long reactionId;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Column(name = "user_name", length = 150)
    private String userName;

    @Column(name = "reaction_type", nullable = false, length = 30)
    private String reactionType = "LIKE"; // LIKE, CLAP, FIRE, TROPHY

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public CommunityPostReaction() {
    }

    public CommunityPostReaction(Long postId, UUID userUuid, String userName, String reactionType) {
        this.postId = postId;
        this.userUuid = userUuid;
        this.userName = userName;
        this.reactionType = reactionType != null ? reactionType : "LIKE";
    }

    public Long getReactionId() {
        return reactionId;
    }

    public void setReactionId(Long reactionId) {
        this.reactionId = reactionId;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(UUID userUuid) {
        this.userUuid = userUuid;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getReactionType() {
        return reactionType;
    }

    public void setReactionType(String reactionType) {
        this.reactionType = reactionType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
