package com.athlon.tournamentservice.teamchampionship.dto.request;

import java.util.List;

public class SubmitLineupRequest {
    private Long fixtureId;
    private Long teamId;
    private Long submittedByUserId;
    private String preferredCategoryOrder; // comma-separated eventIds
    private List<LineupEntryDTO> entries;

    public SubmitLineupRequest() {}

    public Long getFixtureId() { return fixtureId; }
    public void setFixtureId(Long fixtureId) { this.fixtureId = fixtureId; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public Long getSubmittedByUserId() { return submittedByUserId; }
    public void setSubmittedByUserId(Long submittedByUserId) { this.submittedByUserId = submittedByUserId; }

    public String getPreferredCategoryOrder() { return preferredCategoryOrder; }
    public void setPreferredCategoryOrder(String preferredCategoryOrder) { this.preferredCategoryOrder = preferredCategoryOrder; }

    public List<LineupEntryDTO> getEntries() { return entries; }
    public void setEntries(List<LineupEntryDTO> entries) { this.entries = entries; }
}
