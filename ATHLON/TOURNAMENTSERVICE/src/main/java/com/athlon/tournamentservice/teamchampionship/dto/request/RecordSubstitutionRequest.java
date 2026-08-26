package com.athlon.tournamentservice.teamchampionship.dto.request;

public class RecordSubstitutionRequest {
    private Long fixtureId;
    private Long subMatchId;
    private Long teamId;
    private Long originalPlayerId;
    private String originalPlayerName;
    private Long replacementPlayerId;
    private String replacementPlayerName;
    private String reason;
    private Long approvedByUserId;

    public RecordSubstitutionRequest() {}

    public Long getFixtureId() { return fixtureId; }
    public void setFixtureId(Long fixtureId) { this.fixtureId = fixtureId; }

    public Long getSubMatchId() { return subMatchId; }
    public void setSubMatchId(Long subMatchId) { this.subMatchId = subMatchId; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public Long getOriginalPlayerId() { return originalPlayerId; }
    public void setOriginalPlayerId(Long originalPlayerId) { this.originalPlayerId = originalPlayerId; }

    public String getOriginalPlayerName() { return originalPlayerName; }
    public void setOriginalPlayerName(String originalPlayerName) { this.originalPlayerName = originalPlayerName; }

    public Long getReplacementPlayerId() { return replacementPlayerId; }
    public void setReplacementPlayerId(Long replacementPlayerId) { this.replacementPlayerId = replacementPlayerId; }

    public String getReplacementPlayerName() { return replacementPlayerName; }
    public void setReplacementPlayerName(String replacementPlayerName) { this.replacementPlayerName = replacementPlayerName; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Long getApprovedByUserId() { return approvedByUserId; }
    public void setApprovedByUserId(Long approvedByUserId) { this.approvedByUserId = approvedByUserId; }
}
