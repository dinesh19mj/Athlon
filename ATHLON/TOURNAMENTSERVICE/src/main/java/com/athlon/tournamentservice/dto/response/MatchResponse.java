package com.athlon.tournamentservice.dto.response;

import com.athlon.tournamentservice.match.entity.Match;

import java.time.LocalDateTime;
import java.util.UUID;

public class MatchResponse {

    private Long id;
    private UUID uuid;
    private Long teamARegistrationId;
    private Long teamBRegistrationId;
    private Long courtId;
    private LocalDateTime scheduledTime;
    private String status;
    private Long winnerRegistrationId;

    public MatchResponse() {
    }

    public static MatchResponse fromEntity(Match match) {
        if (match == null) return null;
        MatchResponse response = new MatchResponse();
        response.setId(match.getId());
        response.setUuid(match.getUuid());
        response.setTeamARegistrationId(match.getTeamARegistrationId());
        response.setTeamBRegistrationId(match.getTeamBRegistrationId());
        response.setCourtId(match.getCourtId());
        response.setScheduledTime(match.getScheduledTime());
        response.setStatus(match.getStatus());
        response.setWinnerRegistrationId(match.getWinnerRegistrationId());
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }
    public Long getTeamARegistrationId() { return teamARegistrationId; }
    public void setTeamARegistrationId(Long teamARegistrationId) { this.teamARegistrationId = teamARegistrationId; }
    public Long getTeamBRegistrationId() { return teamBRegistrationId; }
    public void setTeamBRegistrationId(Long teamBRegistrationId) { this.teamBRegistrationId = teamBRegistrationId; }
    public Long getCourtId() { return courtId; }
    public void setCourtId(Long courtId) { this.courtId = courtId; }
    public LocalDateTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getWinnerRegistrationId() { return winnerRegistrationId; }
    public void setWinnerRegistrationId(Long winnerRegistrationId) { this.winnerRegistrationId = winnerRegistrationId; }
}

