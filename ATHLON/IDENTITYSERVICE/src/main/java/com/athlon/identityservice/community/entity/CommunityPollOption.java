package com.athlon.identityservice.community.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "community_poll_options")
public class CommunityPollOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "option_id", updatable = false, nullable = false)
    private Long optionId;

    @Column(name = "poll_id", nullable = false)
    private Long pollId;

    @Column(name = "option_text", nullable = false, length = 200)
    private String optionText;

    @Column(name = "votes_count", nullable = false)
    private Integer votesCount = 0;

    public CommunityPollOption() {
    }

    public CommunityPollOption(Long pollId, String optionText) {
        this.pollId = pollId;
        this.optionText = optionText;
        this.votesCount = 0;
    }

    @PrePersist
    public void prePersist() {
        if (votesCount == null) votesCount = 0;
    }

    public Long getOptionId() {
        return optionId;
    }

    public void setOptionId(Long optionId) {
        this.optionId = optionId;
    }

    public Long getPollId() {
        return pollId;
    }

    public void setPollId(Long pollId) {
        this.pollId = pollId;
    }

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }

    public Integer getVotesCount() {
        return votesCount;
    }

    public void setVotesCount(Integer votesCount) {
        this.votesCount = votesCount;
    }
}
