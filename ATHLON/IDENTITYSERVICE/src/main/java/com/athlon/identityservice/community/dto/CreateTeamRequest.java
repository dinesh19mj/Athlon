package com.athlon.identityservice.community.dto;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;

public class CreateTeamRequest {

    @NotBlank(message = "Team name is required")
    private String name;

    @NotBlank(message = "Sport is required")
    private String sport;

    private String logoUrl;
    private UUID captainUserUuid;
    private List<UUID> memberUserUuids;

    public CreateTeamRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSport() {
        return sport;
    }

    public void setSport(String sport) {
        this.sport = sport;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public UUID getCaptainUserUuid() {
        return captainUserUuid;
    }

    public void setCaptainUserUuid(UUID captainUserUuid) {
        this.captainUserUuid = captainUserUuid;
    }

    public List<UUID> getMemberUserUuids() {
        return memberUserUuids;
    }

    public void setMemberUserUuids(List<UUID> memberUserUuids) {
        this.memberUserUuids = memberUserUuids;
    }
}
