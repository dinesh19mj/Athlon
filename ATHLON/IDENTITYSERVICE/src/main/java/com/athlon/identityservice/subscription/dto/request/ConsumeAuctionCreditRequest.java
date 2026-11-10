package com.athlon.identityservice.subscription.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ConsumeAuctionCreditRequest {

    @NotNull
    private Long organizationId;

    @NotBlank
    private String tournamentUuid;

    private Long activatedBy;
    private String notes;

    public ConsumeAuctionCreditRequest() {
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

    public Long getActivatedBy() {
        return activatedBy;
    }

    public void setActivatedBy(Long activatedBy) {
        this.activatedBy = activatedBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

