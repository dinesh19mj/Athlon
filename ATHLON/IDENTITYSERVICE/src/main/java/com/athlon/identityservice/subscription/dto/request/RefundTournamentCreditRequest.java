package com.athlon.identityservice.subscription.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RefundTournamentCreditRequest {

    @NotNull
    private Long organizationId;

    @NotBlank
    private String tournamentUuid;

    private String reason;

    public RefundTournamentCreditRequest() {
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

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

