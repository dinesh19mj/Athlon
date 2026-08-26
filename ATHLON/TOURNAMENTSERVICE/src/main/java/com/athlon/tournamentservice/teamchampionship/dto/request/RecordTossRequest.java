package com.athlon.tournamentservice.teamchampionship.dto.request;

public class RecordTossRequest {
    private Long fixtureId;
    private Long tossWinnerTeamId;
    private String decision; // "CHOSE_CATEGORY_ORDER", "CHOSE_SIDE", "CHOSE_SERVE"
    private String selectedOrder; // comma-separated eventIds
    private Long conductedByUserId;

    public RecordTossRequest() {}

    public Long getFixtureId() { return fixtureId; }
    public void setFixtureId(Long fixtureId) { this.fixtureId = fixtureId; }

    public Long getTossWinnerTeamId() { return tossWinnerTeamId; }
    public void setTossWinnerTeamId(Long tossWinnerTeamId) { this.tossWinnerTeamId = tossWinnerTeamId; }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public String getSelectedOrder() { return selectedOrder; }
    public void setSelectedOrder(String selectedOrder) { this.selectedOrder = selectedOrder; }

    public Long getConductedByUserId() { return conductedByUserId; }
    public void setConductedByUserId(Long conductedByUserId) { this.conductedByUserId = conductedByUserId; }
}
