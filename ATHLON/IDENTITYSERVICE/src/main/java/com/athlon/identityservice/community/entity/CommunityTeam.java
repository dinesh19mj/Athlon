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
@Table(name = "community_teams")
public class CommunityTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_id", updatable = false, nullable = false)
    private Long teamId;

    @Column(name = "team_uuid", updatable = false, nullable = false, unique = true)
    private UUID teamUuid;

    @Column(name = "community_uuid", nullable = false)
    private UUID communityUuid;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "sport", nullable = false, length = 80)
    private String sport;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "captain_user_uuid")
    private UUID captainUserUuid;

    @Column(name = "captain_name", length = 150)
    private String captainName;

    @Column(name = "members_count", nullable = false)
    private Integer membersCount = 1;

    @Column(name = "matches_played", nullable = false)
    private Integer matchesPlayed = 0;

    @Column(name = "matches_won", nullable = false)
    private Integer matchesWon = 0;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CommunityTeam() {
    }

    @PrePersist
    public void prePersist() {
        if (teamUuid == null) {
            teamUuid = UUID.randomUUID();
        }
        if (membersCount == null) membersCount = 1;
        if (matchesPlayed == null) matchesPlayed = 0;
        if (matchesWon == null) matchesWon = 0;
        if (status == null) status = "ACTIVE";
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public UUID getTeamUuid() {
        return teamUuid;
    }

    public void setTeamUuid(UUID teamUuid) {
        this.teamUuid = teamUuid;
    }

    public UUID getCommunityUuid() {
        return communityUuid;
    }

    public void setCommunityUuid(UUID communityUuid) {
        this.communityUuid = communityUuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSport() {
        return sport;
    }

    public void setSport(String sport) {
        this.sport = sport;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public UUID getCaptainUserUuid() {
        return captainUserUuid;
    }

    public void setCaptainUserUuid(UUID captainUserUuid) {
        this.captainUserUuid = captainUserUuid;
    }

    public String getCaptainName() {
        return captainName;
    }

    public void setCaptainName(String captainName) {
        this.captainName = captainName;
    }

    public Integer getMembersCount() {
        return membersCount;
    }

    public void setMembersCount(Integer membersCount) {
        this.membersCount = membersCount;
    }

    public Integer getMatchesPlayed() {
        return matchesPlayed;
    }

    public void setMatchesPlayed(Integer matchesPlayed) {
        this.matchesPlayed = matchesPlayed;
    }

    public Integer getMatchesWon() {
        return matchesWon;
    }

    public void setMatchesWon(Integer matchesWon) {
        this.matchesWon = matchesWon;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
