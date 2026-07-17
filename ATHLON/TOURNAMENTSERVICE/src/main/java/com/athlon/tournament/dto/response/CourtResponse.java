package com.athlon.tournament.dto.response;

import com.athlon.tournament.court.entity.Court;

import java.util.UUID;

public class CourtResponse {

    private Long id;
    private UUID uuid;
    private Long venueId;
    private String name;
    private String sportType;
    private boolean isActive;

    public CourtResponse() {
    }

    public static CourtResponse fromEntity(Court court) {
        if (court == null) return null;
        CourtResponse response = new CourtResponse();
        response.setId(court.getId());
        response.setUuid(court.getUuid());
        response.setVenueId(court.getVenueId());
        response.setName(court.getName());
        response.setSportType(court.getSportType());
        response.setActive(court.isActive());
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }
    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSportType() { return sportType; }
    public void setSportType(String sportType) { this.sportType = sportType; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
