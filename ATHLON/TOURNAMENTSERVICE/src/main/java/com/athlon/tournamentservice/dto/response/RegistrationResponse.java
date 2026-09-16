package com.athlon.tournamentservice.dto.response;

import com.athlon.tournamentservice.registration.entity.Registration;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class RegistrationResponse {

	private Long registrationId;
    private UUID registrationUuid;

    private Long tournamentId;
    private UUID tournamentUuid;

    private Long categoryId;
    private UUID categoryUuid;

    private String teamName;

    private String place;

    private String status;

    private String paymentStatus;

    private String registrationSource;

    private String gender;

    private LocalDateTime createdAt;

    private List<PlayerResponse> players;

    public RegistrationResponse() {
    }

    public static RegistrationResponse fromEntity(Registration registration) {

        if (registration == null) {
            return null;
        }

        RegistrationResponse response = new RegistrationResponse();

        response.setRegistrationId(registration.getRegistrationId());
        response.setRegistrationUuid(registration.getRegistrationUuid());
        response.setTournamentId(registration.getTournamentId());
        response.setTournamentUuid(registration.getTournamentUuid());
        response.setCategoryId(registration.getCategoryId());
        response.setCategoryUuid(registration.getCategoryUuid());
        response.setTeamName(registration.getTeamName());
        response.setPlace(registration.getPlace());
        response.setStatus(registration.getStatus());
        response.setPaymentStatus(registration.getPaymentStatus());
        response.setRegistrationSource(registration.getRegistrationSource() != null ? registration.getRegistrationSource() : "USER_REGISTRATION");
        response.setGender(registration.getGender());
        response.setCreatedAt(registration.getCreatedAt());

        return response;
    }

    public static RegistrationResponse fromEntity(Registration registration, List<PlayerResponse> players) {
        RegistrationResponse response = fromEntity(registration);
        if (response != null) {
            response.setPlayers(players);
        }
        return response;
    }

    public Long getRegistrationId() {
        return registrationId;
    }

    public void setRegistrationId(Long registrationId) {
        this.registrationId = registrationId;
    }

    public UUID getRegistrationUuid() {
        return registrationUuid;
    }

    public void setRegistrationUuid(UUID registrationUuid) {
        this.registrationUuid = registrationUuid;
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

    public List<PlayerResponse> getPlayers() {
        return players;
    }

    public void setPlayers(List<PlayerResponse> players) {
        this.players = players;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

