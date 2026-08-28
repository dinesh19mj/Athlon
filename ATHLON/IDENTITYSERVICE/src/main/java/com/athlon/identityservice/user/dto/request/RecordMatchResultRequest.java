package com.athlon.identityservice.user.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public class RecordMatchResultRequest {

    @NotNull(message = "Winner User UUID is required")
    private UUID winnerUserUuid;

    @NotNull(message = "Loser User UUID is required")
    private UUID loserUserUuid;

    private String sportName = "Badminton";

    private String matchType; // SINGLES, DOUBLES, etc.

    public RecordMatchResultRequest() {
    }

    public RecordMatchResultRequest(UUID winnerUserUuid, UUID loserUserUuid, String sportName) {
        this.winnerUserUuid = winnerUserUuid;
        this.loserUserUuid = loserUserUuid;
        this.sportName = sportName;
    }

    public UUID getWinnerUserUuid() {
        return winnerUserUuid;
    }

    public void setWinnerUserUuid(UUID winnerUserUuid) {
        this.winnerUserUuid = winnerUserUuid;
    }

    public UUID getLoserUserUuid() {
        return loserUserUuid;
    }

    public void setLoserUserUuid(UUID loserUserUuid) {
        this.loserUserUuid = loserUserUuid;
    }

    public String getSportName() {
        return sportName != null ? sportName : "Badminton";
    }

    public void setSportName(String sportName) {
        this.sportName = sportName;
    }

    public String getMatchType() {
        return matchType;
    }

    public void setMatchType(String matchType) {
        this.matchType = matchType;
    }
}
