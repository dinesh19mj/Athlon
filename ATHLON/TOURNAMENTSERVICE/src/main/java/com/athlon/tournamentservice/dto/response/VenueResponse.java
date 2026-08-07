package com.athlon.tournamentservice.dto.response;

import com.athlon.tournamentservice.court.entity.Venue;

import java.util.UUID;

public class VenueResponse {

    private Long id;
    private UUID uuid;
    private String name;
    private String address;
    private Long cityId;
    private boolean isActive;

    public VenueResponse() {
    }

    public static VenueResponse fromEntity(Venue venue) {
        if (venue == null) return null;
        VenueResponse response = new VenueResponse();
        response.setId(venue.getId());
        response.setUuid(venue.getUuid());
        response.setName(venue.getName());
        response.setAddress(venue.getAddress());
        response.setCityId(venue.getCityId());
        response.setActive(venue.isActive());
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Long getCityId() { return cityId; }
    public void setCityId(Long cityId) { this.cityId = cityId; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}

