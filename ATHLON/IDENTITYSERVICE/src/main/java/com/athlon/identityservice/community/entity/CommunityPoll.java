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
@Table(name = "community_polls")
public class CommunityPoll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "poll_id", updatable = false, nullable = false)
    private Long pollId;

    @Column(name = "poll_uuid", updatable = false, nullable = false, unique = true)
    private UUID pollUuid;

    @Column(name = "community_uuid", nullable = false)
    private UUID communityUuid;

    @Column(name = "question", nullable = false, length = 300)
    private String question;

    @Column(name = "created_by_user_uuid", nullable = false)
    private UUID createdByUserUuid;

    @Column(name = "created_by_user_name", length = 150)
    private String createdByUserName;

    @Column(name = "allow_multiple_choices", nullable = false)
    private Boolean allowMultipleChoices = false;

    @Column(name = "total_votes", nullable = false)
    private Integer totalVotes = 0;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "is_closed", nullable = false)
    private Boolean isClosed = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @jakarta.persistence.Transient
    private java.util.List<CommunityPollOption> options = new java.util.ArrayList<>();

    @jakarta.persistence.Transient
    private java.util.List<Long> userVotedOptionIds = new java.util.ArrayList<>();

    public CommunityPoll() {
    }

    @PrePersist
    public void prePersist() {
        if (pollUuid == null) {
            pollUuid = UUID.randomUUID();
        }
        if (allowMultipleChoices == null) allowMultipleChoices = false;
        if (totalVotes == null) totalVotes = 0;
        if (isClosed == null) isClosed = false;
    }

    public Long getPollId() {
        return pollId;
    }

    public void setPollId(Long pollId) {
        this.pollId = pollId;
    }

    public UUID getPollUuid() {
        return pollUuid;
    }

    public void setPollUuid(UUID pollUuid) {
        this.pollUuid = pollUuid;
    }

    public UUID getCommunityUuid() {
        return communityUuid;
    }

    public void setCommunityUuid(UUID communityUuid) {
        this.communityUuid = communityUuid;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
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

    public Boolean getAllowMultipleChoices() {
        return allowMultipleChoices;
    }

    public void setAllowMultipleChoices(Boolean allowMultipleChoices) {
        this.allowMultipleChoices = allowMultipleChoices;
    }

    public Integer getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(Integer totalVotes) {
        this.totalVotes = totalVotes;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Boolean getIsClosed() {
        return isClosed;
    }

    public void setIsClosed(Boolean isClosed) {
        this.isClosed = isClosed;
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

    public java.util.List<CommunityPollOption> getOptions() {
        return options;
    }

    public void setOptions(java.util.List<CommunityPollOption> options) {
        this.options = options;
    }

    public java.util.List<Long> getUserVotedOptionIds() {
        return userVotedOptionIds;
    }

    public void setUserVotedOptionIds(java.util.List<Long> userVotedOptionIds) {
        this.userVotedOptionIds = userVotedOptionIds;
    }
}
