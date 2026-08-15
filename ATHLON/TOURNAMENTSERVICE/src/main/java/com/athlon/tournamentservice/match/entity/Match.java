package com.athlon.tournamentservice.match.entity;

import java.time.LocalDateTime;
import java.util.Objects;
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
@Table(name = "matches")
public class Match {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "matchid", updatable = false, nullable = false)
    private Long matchId;

    @Column(name = "matchuuid", updatable = false, nullable = false, unique = true)
    private UUID matchUuid;

    @Column(name = "tournamentid")
    private Long tournamentId;

    @Column(name = "tournamentuuid")
    private UUID tournamentUuid;

    @Column(name = "teamaregistrationid")
    private Long teamARegistrationId;

    @Column(name = "teamaregistrationuuid")
    private UUID teamARegistrationUuid;

    @Column(name = "teambregistrationid")
    private Long teamBRegistrationId;

    @Column(name = "teambregistrationuuid")
    private UUID teamBRegistrationUuid;

    @Column(name = "courtid")
    private Long courtId;

    @Column(name = "courtuuid")
    private UUID courtUuid;

    @Column(name = "poolid")
    private Long poolId;

    @Column(name = "poolname")
    private String poolName;

    @Column(name = "scheduledtime")
    private LocalDateTime scheduledTime;

    @Column(name = "status", nullable = false)
    private String status = "SCHEDULED";

    @Column(name = "winnerregistrationid")
    private Long winnerRegistrationId;

    @Column(name = "winnerregistrationuuid")
    private UUID winnerRegistrationUuid;

    @Column(name = "nextmatchid")
    private Long nextMatchId;

    @Column(name = "nextmatchuuid")
    private UUID nextMatchUuid;

    @Column(name = "isactive")
    private Integer isActive = 1;

    @Column(name = "umpire_phone", length = 20)
    private String umpirePhone;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    public Match() {
    }

    public Match(
            Long teamARegistrationId,
            UUID teamARegistrationUuid,
            Long teamBRegistrationId,
            UUID teamBRegistrationUuid,
            Long courtId,
            UUID courtUuid,
            LocalDateTime scheduledTime,
            Long createdBy) {

        this.teamARegistrationId = teamARegistrationId;
        this.teamARegistrationUuid = teamARegistrationUuid;
        this.teamBRegistrationId = teamBRegistrationId;
        this.teamBRegistrationUuid = teamBRegistrationUuid;
        this.courtId = courtId;
        this.courtUuid = courtUuid;
        this.scheduledTime = scheduledTime;
        this.createdBy = createdBy;
        this.status = "SCHEDULED";
        this.isActive = 1;
    }

    @PrePersist
    public void prePersist() {

        if (matchUuid == null) {
            matchUuid = UUID.randomUUID();
        }

        if (status == null) {
            status = "SCHEDULED";
        }

        if (isActive == null) {
            isActive = 1;
        }
    }

    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }

    public UUID getMatchUuid() {
        return matchUuid;
    }

    public void setMatchUuid(UUID matchUuid) {
        this.matchUuid = matchUuid;
    }

    public Long getTournamentId() {
        return tournamentId;
    }

    public void setTournamentId(Long tournamentId) {
        this.tournamentId = tournamentId;
    }

    public UUID getTournamentUuid() {
        return tournamentUuid;
    }

    public void setTournamentUuid(UUID tournamentUuid) {
        this.tournamentUuid = tournamentUuid;
    }

    public Long getTeamARegistrationId() {
        return teamARegistrationId;
    }

    public void setTeamARegistrationId(Long teamARegistrationId) {
        this.teamARegistrationId = teamARegistrationId;
    }

    public UUID getTeamARegistrationUuid() {
        return teamARegistrationUuid;
    }

    public void setTeamARegistrationUuid(UUID teamARegistrationUuid) {
        this.teamARegistrationUuid = teamARegistrationUuid;
    }

    public Long getTeamBRegistrationId() {
        return teamBRegistrationId;
    }

    public void setTeamBRegistrationId(Long teamBRegistrationId) {
        this.teamBRegistrationId = teamBRegistrationId;
    }

    public UUID getTeamBRegistrationUuid() {
        return teamBRegistrationUuid;
    }

    public void setTeamBRegistrationUuid(UUID teamBRegistrationUuid) {
        this.teamBRegistrationUuid = teamBRegistrationUuid;
    }

    public Long getCourtId() {
        return courtId;
    }

    public void setCourtId(Long courtId) {
        this.courtId = courtId;
    }

    public UUID getCourtUuid() {
        return courtUuid;
    }

    public void setCourtUuid(UUID courtUuid) {
        this.courtUuid = courtUuid;
    }

    public Long getPoolId() {
        return poolId;
    }

    public void setPoolId(Long poolId) {
        this.poolId = poolId;
    }

    public String getPoolName() {
        return poolName;
    }

    public void setPoolName(String poolName) {
        this.poolName = poolName;
    }

    public LocalDateTime getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(LocalDateTime scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getWinnerRegistrationId() {
        return winnerRegistrationId;
    }

    public void setWinnerRegistrationId(Long winnerRegistrationId) {
        this.winnerRegistrationId = winnerRegistrationId;
    }

    public UUID getWinnerRegistrationUuid() {
        return winnerRegistrationUuid;
    }

    public void setWinnerRegistrationUuid(UUID winnerRegistrationUuid) {
        this.winnerRegistrationUuid = winnerRegistrationUuid;
    }

    public Long getNextMatchId() {
        return nextMatchId;
    }

    public void setNextMatchId(Long nextMatchId) {
        this.nextMatchId = nextMatchId;
    }

    public UUID getNextMatchUuid() {
        return nextMatchUuid;
    }

    public void setNextMatchUuid(UUID nextMatchUuid) {
        this.nextMatchUuid = nextMatchUuid;
    }

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }

    public String getUmpirePhone() {
        return umpirePhone;
    }

    public void setUmpirePhone(String umpirePhone) {
        this.umpirePhone = umpirePhone;
    }

    public boolean isActive() {
        return isActive != null && isActive == 1;
    }

    public void setActive(boolean active) {
        this.isActive = active ? 1 : 0;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }

        if (!(o instanceof Match)) {
            return false;
        }

        Match match = (Match) o;

        return Objects.equals(matchId, match.matchId)
                && Objects.equals(matchUuid, match.matchUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(matchId, matchUuid);
    }

    @Override
    public String toString() {
        return "Match{" +
                "matchId=" + matchId +
                ", matchUuid=" + matchUuid +
                ", teamARegistrationId=" + teamARegistrationId +
                ", teamARegistrationUuid=" + teamARegistrationUuid +
                ", teamBRegistrationId=" + teamBRegistrationId +
                ", teamBRegistrationUuid=" + teamBRegistrationUuid +
                ", courtId=" + courtId +
                ", courtUuid=" + courtUuid +
                ", scheduledTime=" + scheduledTime +
                ", status='" + status + '\'' +
                ", winnerRegistrationId=" + winnerRegistrationId +
                ", winnerRegistrationUuid=" + winnerRegistrationUuid +
                ", nextMatchId=" + nextMatchId +
                ", nextMatchUuid=" + nextMatchUuid +
                ", isActive=" + isActive +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", createdBy=" + createdBy +
                ", updatedBy=" + updatedBy +
                ", umpirePhone='" + umpirePhone + '\'' +
                '}';
    }
}

