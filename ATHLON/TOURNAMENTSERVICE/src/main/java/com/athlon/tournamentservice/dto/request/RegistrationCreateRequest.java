package com.athlon.tournamentservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import java.util.List;

public class RegistrationCreateRequest {

	@NotNull(message = "Tournament ID is required")
    private Long tournamentId;

    @NotNull(message = "Tournament UUID is required")
    private UUID tournamentUuid;

    @NotBlank(message = "Team name is required")
    private String teamName;

    private String place;

    private Long categoryId;

    private UUID categoryUuid;

    private Long primaryContactId;

    private UUID primaryContactUuid;

    @NotNull(message = "Players are required")
    private List<PlayerRequest> players;

    private String status;

    private String paymentStatus;

    private String registrationSource;

    private String gender;

    private Long createdBy;

    public RegistrationCreateRequest() {
    }

    public Long getTournamentId() {
        return tournamentId;
    }

    public void setTournamentId(Long tournamentId) {
        this.tournamentId = tournamentId;
    }

    public UUID getTournamentUuid() {
        return tournamentUuid;
    }

    public void setTournamentUuid(UUID tournamentUuid) {
        this.tournamentUuid = tournamentUuid;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getPlace() {
        return place;
    }

    public void setPlace(String place) {
        this.place = place;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public UUID getCategoryUuid() {
        return categoryUuid;
    }

    public void setCategoryUuid(UUID categoryUuid) {
        this.categoryUuid = categoryUuid;
    }

    public Long getPrimaryContactId() {
        return primaryContactId;
    }

    public void setPrimaryContactId(Long primaryContactId) {
        this.primaryContactId = primaryContactId;
    }

    public UUID getPrimaryContactUuid() {
        return primaryContactUuid;
    }

    public void setPrimaryContactUuid(UUID primaryContactUuid) {
        this.primaryContactUuid = primaryContactUuid;
    }

    public List<PlayerRequest> getPlayers() {
        return players;
    }

    public void setPlayers(List<PlayerRequest> players) {
        this.players = players;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getRegistrationSource() {
        return registrationSource;
    }

    public void setRegistrationSource(String registrationSource) {
        this.registrationSource = registrationSource;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }
}

