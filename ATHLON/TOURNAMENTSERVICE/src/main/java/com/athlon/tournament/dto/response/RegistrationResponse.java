package com.athlon.tournament.dto.response;

import com.athlon.tournament.registration.entity.Registration;

import java.util.UUID;

public class RegistrationResponse {

    private Long id;
    private UUID uuid;
    private Long tournamentId;
    private Long categoryId;
    private String teamName;
    private Long primaryContactId;
    private String status;
    private boolean isActive;

    public RegistrationResponse() {
    }

    public static RegistrationResponse fromEntity(Registration registration) {
        if (registration == null) return null;
        RegistrationResponse response = new RegistrationResponse();
        response.setId(registration.getId());
        response.setUuid(registration.getUuid());
        response.setTournamentId(registration.getTournamentId());
        response.setCategoryId(registration.getCategoryId());
        response.setTeamName(registration.getTeamName());
        response.setPrimaryContactId(registration.getPrimaryContactId());
        response.setStatus(registration.getStatus());
        response.setActive(registration.isActive());
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }
    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public Long getPrimaryContactId() { return primaryContactId; }
    public void setPrimaryContactId(Long primaryContactId) { this.primaryContactId = primaryContactId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
