package com.athlon.tournament.dto.response;

import com.athlon.tournament.tournament.entity.Category;

import java.util.UUID;

public class CategoryResponse {

    private Long id;
    private UUID uuid;
    private Long tournamentId;
    private String name;
    private String sportType;
    private String description;
    private String matchFormat;
    private boolean isActive;

    public CategoryResponse() {
    }

    public static CategoryResponse fromEntity(Category category) {
        if (category == null) return null;
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setUuid(category.getUuid());
        response.setTournamentId(category.getTournamentId());
        response.setName(category.getName());
        response.setSportType(category.getSportType());
        response.setDescription(category.getDescription());
        response.setMatchFormat(category.getMatchFormat());
        response.setActive(category.isActive());
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }
    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSportType() { return sportType; }
    public void setSportType(String sportType) { this.sportType = sportType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getMatchFormat() { return matchFormat; }
    public void setMatchFormat(String matchFormat) { this.matchFormat = matchFormat; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
