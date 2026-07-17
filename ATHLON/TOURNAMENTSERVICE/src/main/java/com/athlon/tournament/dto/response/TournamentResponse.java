package com.athlon.tournament.dto.response;

import com.athlon.tournament.tournament.entity.Tournament;

import java.time.LocalDate;
import java.util.UUID;

public class TournamentResponse {

    private Long id;
    private UUID uuid;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long organizerId;
    private UUID organizerUuid;
    private String status;
    private boolean isActive;

    public TournamentResponse() {
    }

    public static TournamentResponse fromEntity(Tournament tournament) {
        if (tournament == null) return null;
        TournamentResponse response = new TournamentResponse();
        response.setId(tournament.getId());
        response.setUuid(tournament.getUuid());
        response.setName(tournament.getName());
        response.setDescription(tournament.getDescription());
        response.setStartDate(tournament.getStartDate());
        response.setEndDate(tournament.getEndDate());
        response.setOrganizerId(tournament.getOrganizerId());
        response.setOrganizerUuid(tournament.getOrganizerUuid());
        response.setStatus(tournament.getStatus());
        response.setActive(tournament.isActive());
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public Long getOrganizerId() { return organizerId; }
    public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }
    public UUID getOrganizerUuid() { return organizerUuid; }
    public void setOrganizerUuid(UUID organizerUuid) { this.organizerUuid = organizerUuid; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
