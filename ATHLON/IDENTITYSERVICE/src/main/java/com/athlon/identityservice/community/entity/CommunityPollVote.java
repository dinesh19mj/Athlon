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
@Table(name = "community_poll_votes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"poll_id", "option_id", "user_uuid"})
})
public class CommunityPollVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vote_id", updatable = false, nullable = false)
    private Long voteId;

    @Column(name = "poll_id", nullable = false)
    private Long pollId;

    @Column(name = "option_id", nullable = false)
    private Long optionId;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name", length = 150)
    private String userName;

    @CreationTimestamp
    @Column(name = "voted_at", updatable = false)
    private LocalDateTime votedAt;

    public CommunityPollVote() {
    }

    public CommunityPollVote(Long pollId, Long optionId, UUID userUuid, Long userId, String userName) {
        this.pollId = pollId;
        this.optionId = optionId;
        this.userUuid = userUuid;
        this.userId = userId;
        this.userName = userName;
    }

    public Long getVoteId() {
        return voteId;
    }

    public void setVoteId(Long voteId) {
        this.voteId = voteId;
    }

    public Long getPollId() {
        return pollId;
    }

    public void setPollId(Long pollId) {
        this.pollId = pollId;
    }

    public Long getOptionId() {
        return optionId;
    }

    public void setOptionId(Long optionId) {
        this.optionId = optionId;
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

    public LocalDateTime getVotedAt() {
        return votedAt;
    }

    public void setVotedAt(LocalDateTime votedAt) {
        this.votedAt = votedAt;
    }
}
