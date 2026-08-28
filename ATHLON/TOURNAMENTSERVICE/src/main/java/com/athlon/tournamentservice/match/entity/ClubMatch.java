package com.athlon.tournamentservice.match.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "club_matches")
public class ClubMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "matchid")
    private Long matchId;

    @Column(name = "orgid")
    private Long orgId;

    @Column(name = "orguuid", length = 100)
    private String orgUuid;

    @Column(name = "sporttype", length = 100)
    private String sportType;

    @Column(name = "matchtype", length = 50)
    private String matchType;

    @Column(name = "matchdate")
    private LocalDate matchDate;

    @Column(name = "teamaplayers", columnDefinition = "TEXT")
    private String teamAPlayers;

    @Column(name = "teambplayers", columnDefinition = "TEXT")
    private String teamBPlayers;

    @Column(name = "score", columnDefinition = "TEXT")
    private String score;

    @Column(name = "winner", length = 100)
    private String winner;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "createdby")
    private Long createdBy;

    @Column(name = "createdon")
    private LocalDateTime createdOn;

    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }

    public Long getOrgId() {
        return orgId;
    }

    public void setOrgId(Long orgId) {
        this.orgId = orgId;
    }

    public String getOrgUuid() {
        return orgUuid;
    }

    public void setOrgUuid(String orgUuid) {
        this.orgUuid = orgUuid;
    }

    public String getSportType() {
        return sportType;
    }

    public void setSportType(String sportType) {
        this.sportType = sportType;
    }

    public String getMatchType() {
        return matchType;
    }

    public void setMatchType(String matchType) {
        this.matchType = matchType;
    }

    public LocalDate getMatchDate() {
        return matchDate;
    }

    public void setMatchDate(LocalDate matchDate) {
        this.matchDate = matchDate;
    }

    public String getTeamAPlayers() {
        return teamAPlayers;
    }

    public void setTeamAPlayers(String teamAPlayers) {
        this.teamAPlayers = teamAPlayers;
    }

    public String getTeamBPlayers() {
        return teamBPlayers;
    }

    public void setTeamBPlayers(String teamBPlayers) {
        this.teamBPlayers = teamBPlayers;
    }

    public String getScore() {
        return score;
    }

    public void setScore(String score) {
        this.score = score;
    }

    public String getWinner() {
        return winner;
    }

    public void setWinner(String winner) {
        this.winner = winner;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedOn() {
        return createdOn;
    }

    public void setCreatedOn(LocalDateTime createdOn) {
        this.createdOn = createdOn;
    }
}
