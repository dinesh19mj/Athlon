package com.athlon.tournament.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

public class MatchCreateRequest {

    @NotNull(message = "Team A Registration ID is required")
    private Long teamARegistrationId;

    @NotNull(message = "Team A Registration UUID is required")
    private UUID teamARegistrationUuid;

    @NotNull(message = "Team B Registration ID is required")
    private Long teamBRegistrationId;

    @NotNull(message = "Team B Registration UUID is required")
    private UUID teamBRegistrationUuid;

    private Long courtId;
    private UUID courtUuid;

    private LocalDateTime scheduledTime;

    private Long createdBy;

    public MatchCreateRequest() {
    }

    public Long getTeamARegistrationId() { return teamARegistrationId; }
    public void setTeamARegistrationId(Long teamARegistrationId) { this.teamARegistrationId = teamARegistrationId; }
    public UUID getTeamARegistrationUuid() { return teamARegistrationUuid; }
    public void setTeamARegistrationUuid(UUID teamARegistrationUuid) { this.teamARegistrationUuid = teamARegistrationUuid; }
    public Long getTeamBRegistrationId() { return teamBRegistrationId; }
    public void setTeamBRegistrationId(Long teamBRegistrationId) { this.teamBRegistrationId = teamBRegistrationId; }
    public UUID getTeamBRegistrationUuid() { return teamBRegistrationUuid; }
    public void setTeamBRegistrationUuid(UUID teamBRegistrationUuid) { this.teamBRegistrationUuid = teamBRegistrationUuid; }
    public Long getCourtId() { return courtId; }
    public void setCourtId(Long courtId) { this.courtId = courtId; }
    public UUID getCourtUuid() { return courtUuid; }
    public void setCourtUuid(UUID courtUuid) { this.courtUuid = courtUuid; }
    public LocalDateTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
}
