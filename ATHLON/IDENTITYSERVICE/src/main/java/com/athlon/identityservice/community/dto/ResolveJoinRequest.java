package com.athlon.identityservice.community.dto;

import com.athlon.identityservice.community.enums.CommunityMemberStatus;

import jakarta.validation.constraints.NotNull;

public class ResolveJoinRequest {

    @NotNull(message = "Decision status is required")
    private CommunityMemberStatus status; // ACTIVE (approve) or REJECTED

    public ResolveJoinRequest() {
    }

    public CommunityMemberStatus getStatus() {
        return status;
    }

    public void setStatus(CommunityMemberStatus status) {
        this.status = status;
    }
}
