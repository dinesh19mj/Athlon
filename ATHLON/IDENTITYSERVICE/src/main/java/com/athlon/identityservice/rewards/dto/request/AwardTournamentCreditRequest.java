package com.athlon.identityservice.rewards.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AwardTournamentCreditRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Tournament ID is required")
    private String tournamentId;

    private String tournamentName;

    private String notes;

    public AwardTournamentCreditRequest() {
    }

    public AwardTournamentCreditRequest(Long userId, String tournamentId, String tournamentName, String notes) {
        this.userId = userId;
        this.tournamentId = tournamentId;
        this.tournamentName = tournamentName;
        this.notes = notes;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTournamentId() {
        return tournamentId;
    }

    public void setTournamentId(String tournamentId) {
        this.tournamentId = tournamentId;
    }

    public String getTournamentName() {
        return tournamentName;
    }

    public void setTournamentName(String tournamentName) {
        this.tournamentName = tournamentName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
