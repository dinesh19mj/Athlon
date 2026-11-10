package com.athlon.identityservice.subscription.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ConsumeTournamentCreditRequest {

    @NotNull
    private Long organizationId;

    @NotBlank
    private String tournamentUuid;

    private Integer participantCount = 0;
    private Integer categoryCount = 0;
    private Integer officialCount = 0;
    private Integer courtCount = 0;
    private Boolean isAuctionMode = false;
    private String notes;

    public ConsumeTournamentCreditRequest() {
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getTournamentUuid() {
        return tournamentUuid;
    }

    public void setTournamentUuid(String tournamentUuid) {
        this.tournamentUuid = tournamentUuid;
    }

    public Integer getParticipantCount() {
        return participantCount;
    }

    public void setParticipantCount(Integer participantCount) {
        this.participantCount = participantCount;
    }

    public Integer getCategoryCount() {
        return categoryCount;
    }

    public void setCategoryCount(Integer categoryCount) {
        this.categoryCount = categoryCount;
    }

    public Integer getOfficialCount() {
        return officialCount;
    }

    public void setOfficialCount(Integer officialCount) {
        this.officialCount = officialCount;
    }

    public Integer getCourtCount() {
        return courtCount;
    }

    public void setCourtCount(Integer courtCount) {
        this.courtCount = courtCount;
    }

    public Boolean getIsAuctionMode() {
        return isAuctionMode;
    }

    public void setIsAuctionMode(Boolean isAuctionMode) {
        this.isAuctionMode = isAuctionMode;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

