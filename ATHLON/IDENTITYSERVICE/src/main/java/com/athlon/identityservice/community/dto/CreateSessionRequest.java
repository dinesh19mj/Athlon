package com.athlon.identityservice.community.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateSessionRequest {

    @NotBlank(message = "Sport is required")
    private String sport;

    @NotBlank(message = "Session title is required")
    private String title;

    private String description;

    @NotNull(message = "Session date is required")
    private LocalDate sessionDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private Long venueId;
    private UUID venueUuid;
    private String venueName;
    private String courtName;
    private String city;
    private String state;
    private String googleMapUrl;
    private String locationAddress;

    private String genderCategory = "BOTH"; // BOTH, MALE, FEMALE, ANY
    private Integer maxMalePlayers;
    private Integer maxFemalePlayers;

    private Integer maxPlayers;
    private String skillLevel = "ALL";
    private BigDecimal costPerPlayer;

    private Boolean isRecurring = false;
    private String recurrenceRule;

    public CreateSessionRequest() {
    }

    public String getSport() {
        return sport;
    }

    public void setSport(String sport) {
        this.sport = sport;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDate sessionDate) {
        this.sessionDate = sessionDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public UUID getVenueUuid() {
        return venueUuid;
    }

    public void setVenueUuid(UUID venueUuid) {
        this.venueUuid = venueUuid;
    }

    public String getVenueName() {
        return venueName;
    }

    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }

    public String getCourtName() {
        return courtName;
    }

    public void setCourtName(String courtName) {
        this.courtName = courtName;
    }

    public String getLocationAddress() {
        return locationAddress;
    }

    public void setLocationAddress(String locationAddress) {
        this.locationAddress = locationAddress;
    }

    public Integer getMaxPlayers() {
        return maxPlayers;
    }

    public void setMaxPlayers(Integer maxPlayers) {
        this.maxPlayers = maxPlayers;
    }

    public String getSkillLevel() {
        return skillLevel;
    }

    public void setSkillLevel(String skillLevel) {
        this.skillLevel = skillLevel;
    }

    public BigDecimal getCostPerPlayer() {
        return costPerPlayer;
    }

    public void setCostPerPlayer(BigDecimal costPerPlayer) {
        this.costPerPlayer = costPerPlayer;
    }

    public BigDecimal getCostPerPerson() {
        return costPerPlayer;
    }

    public void setCostPerPerson(BigDecimal costPerPerson) {
        this.costPerPlayer = costPerPerson;
    }

    public Integer getMaxParticipants() {
        return maxPlayers;
    }

    public void setMaxParticipants(Integer maxParticipants) {
        this.maxPlayers = maxParticipants;
    }

    public Boolean getIsRecurring() {
        return isRecurring;
    }

    public void setIsRecurring(Boolean isRecurring) {
        this.isRecurring = isRecurring;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getGoogleMapUrl() {
        return googleMapUrl;
    }

    public void setGoogleMapUrl(String googleMapUrl) {
        this.googleMapUrl = googleMapUrl;
    }

    public String getGenderCategory() {
        return genderCategory;
    }

    public void setGenderCategory(String genderCategory) {
        this.genderCategory = genderCategory;
    }

    public Integer getMaxMalePlayers() {
        return maxMalePlayers;
    }

    public void setMaxMalePlayers(Integer maxMalePlayers) {
        this.maxMalePlayers = maxMalePlayers;
    }

    public Integer getMaxFemalePlayers() {
        return maxFemalePlayers;
    }

    public void setMaxFemalePlayers(Integer maxFemalePlayers) {
        this.maxFemalePlayers = maxFemalePlayers;
    }

    public String getRecurrenceRule() {
        return recurrenceRule;
    }

    public void setRecurrenceRule(String recurrenceRule) {
        this.recurrenceRule = recurrenceRule;
    }
}
