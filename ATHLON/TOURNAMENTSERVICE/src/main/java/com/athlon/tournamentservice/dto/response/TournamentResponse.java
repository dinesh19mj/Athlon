package com.athlon.tournamentservice.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.athlon.tournamentservice.tournament.entity.Tournament;

public class TournamentResponse {

	private Long tournamentId;
    private UUID tournamentUuid;
    private String name;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime registrationClosingDate;

    private Long organizerId;
    private UUID organizerUuid;

    private Long userId;
    private UUID userUuid;

    private String tournamentType;
    private String sport;
    private String matchFormat;
    private String visibility;
    private String category;
    private Integer playersCount;

    private String location;
    private String mapLink;
    private String contactPhone;
    private Double registrationFees;
    private String poster;

    private String status;
    private Integer isActive;

    public TournamentResponse() {
    }

    public static TournamentResponse fromEntity(Tournament tournament) {

        if (tournament == null) {
            return null;
        }

        TournamentResponse response = new TournamentResponse();

        response.setTournamentId(tournament.getTournamentId());
        response.setTournamentUuid(tournament.getTournamentUuid());
        response.setName(tournament.getName());
        response.setDescription(tournament.getDescription());
        response.setStartDate(tournament.getStartDate());
        response.setEndDate(tournament.getEndDate());
        response.setRegistrationClosingDate(tournament.getRegistrationClosingDate());

        response.setOrganizerId(tournament.getOrganizerId());
        response.setOrganizerUuid(tournament.getOrganizerUuid());

        response.setUserId(tournament.getUserId());
        response.setUserUuid(tournament.getUserUuid());

        response.setTournamentType(tournament.getTournamentType());
        response.setSport(tournament.getSport());
        response.setMatchFormat(tournament.getMatchFormat());
        response.setVisibility(tournament.getVisibility());
        response.setCategory(tournament.getCategory());
        response.setPlayersCount(tournament.getPlayersCount());

        response.setLocation(tournament.getLocation());
        response.setMapLink(tournament.getMapLink());
        response.setContactPhone(tournament.getContactPhone());
        response.setRegistrationFees(tournament.getRegistrationFees());
        response.setPoster(tournament.getPoster());

        response.setStatus(tournament.getStatus());
        response.setIsActive(tournament.getIsActive());

        return response;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public LocalDateTime getRegistrationClosingDate() {
        return registrationClosingDate;
    }

    public void setRegistrationClosingDate(LocalDateTime registrationClosingDate) {
        this.registrationClosingDate = registrationClosingDate;
    }

    public Long getOrganizerId() {
        return organizerId;
    }

    public void setOrganizerId(Long organizerId) {
        this.organizerId = organizerId;
    }

    public UUID getOrganizerUuid() {
        return organizerUuid;
    }

    public void setOrganizerUuid(UUID organizerUuid) {
        this.organizerUuid = organizerUuid;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(UUID userUuid) {
        this.userUuid = userUuid;
    }

    public String getTournamentType() {
        return tournamentType;
    }

    public void setTournamentType(String tournamentType) {
        this.tournamentType = tournamentType;
    }

    public String getSport() {
        return sport;
    }

    public void setSport(String sport) {
        this.sport = sport;
    }

    public String getMatchFormat() {
        return matchFormat;
    }

    public void setMatchFormat(String matchFormat) {
        this.matchFormat = matchFormat;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getPlayersCount() {
        return playersCount;
    }

    public void setPlayersCount(Integer playersCount) {
        this.playersCount = playersCount;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getMapLink() {
        return mapLink;
    }

    public void setMapLink(String mapLink) {
        this.mapLink = mapLink;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public Double getRegistrationFees() {
        return registrationFees;
    }

    public void setRegistrationFees(Double registrationFees) {
        this.registrationFees = registrationFees;
    }

    public String getPoster() {
        return poster;
    }

    public void setPoster(String poster) {
        this.poster = poster;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }
}
