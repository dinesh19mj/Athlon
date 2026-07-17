package com.athlon.tournament.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class RegistrationCreateRequest {

    @NotNull(message = "Tournament ID is required")
    private Long tournamentId;

    @NotNull(message = "Tournament UUID is required")
    private UUID tournamentUuid;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Category UUID is required")
    private UUID categoryUuid;

    @NotBlank(message = "Team name is required")
    private String teamName;

    @NotNull(message = "Primary Contact ID is required")
    private Long primaryContactId;

    @NotNull(message = "Primary Contact UUID is required")
    private UUID primaryContactUuid;

    private Long createdBy;

    public RegistrationCreateRequest() {
    }

    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }
    public UUID getTournamentUuid() { return tournamentUuid; }
    public void setTournamentUuid(UUID tournamentUuid) { this.tournamentUuid = tournamentUuid; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public UUID getCategoryUuid() { return categoryUuid; }
    public void setCategoryUuid(UUID categoryUuid) { this.categoryUuid = categoryUuid; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public Long getPrimaryContactId() { return primaryContactId; }
    public void setPrimaryContactId(Long primaryContactId) { this.primaryContactId = primaryContactId; }
    public UUID getPrimaryContactUuid() { return primaryContactUuid; }
    public void setPrimaryContactUuid(UUID primaryContactUuid) { this.primaryContactUuid = primaryContactUuid; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
}
