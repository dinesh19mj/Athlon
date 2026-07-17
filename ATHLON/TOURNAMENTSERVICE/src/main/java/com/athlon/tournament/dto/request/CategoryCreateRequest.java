package com.athlon.tournament.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CategoryCreateRequest {

    @NotNull(message = "Tournament ID is required")
    private Long tournamentId;

    @NotNull(message = "Tournament UUID is required")
    private UUID tournamentUuid;

    @NotBlank(message = "Category name is required")
    private String name;

    @NotBlank(message = "Sport type is required")
    private String sportType;

    private String description;
    private String matchFormat;

    private Long createdBy;

    public CategoryCreateRequest() {
    }

    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }
    public UUID getTournamentUuid() { return tournamentUuid; }
    public void setTournamentUuid(UUID tournamentUuid) { this.tournamentUuid = tournamentUuid; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSportType() { return sportType; }
    public void setSportType(String sportType) { this.sportType = sportType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getMatchFormat() { return matchFormat; }
    public void setMatchFormat(String matchFormat) { this.matchFormat = matchFormat; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
}
