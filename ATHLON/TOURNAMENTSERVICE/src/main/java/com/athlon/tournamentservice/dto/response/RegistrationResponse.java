package com.athlon.tournamentservice.dto.response;

import com.athlon.tournamentservice.registration.entity.Registration;

import java.util.List;
import java.util.UUID;

public class RegistrationResponse {

	private Long registrationId;
    private UUID registrationUuid;

    private Long tournamentId;
    private UUID tournamentUuid;

    private String teamName;

    private String place;

    private String status;

    private String paymentStatus;

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
        response.setTeamName(registration.getTeamName());
        response.setPlace(registration.getPlace());
        response.setStatus(registration.getStatus());
        response.setPaymentStatus(registration.getPaymentStatus());

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
}

