package com.athlon.tournamentservice.teamevent.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.tournamentservice.registration.entity.Registration;
import com.athlon.tournamentservice.registration.repository.RegistrationRepository;
import com.athlon.tournamentservice.teamevent.entity.TeamEventRosterPlayer;
import com.athlon.tournamentservice.teamevent.repository.TeamEventRosterPlayerRepository;
import com.athlon.tournamentservice.exception.ResourceNotFoundException;

@Service
public class TeamEventRosterService {

    @Autowired
    private TeamEventRosterPlayerRepository rosterPlayerRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    public List<TeamEventRosterPlayer> getTeamRoster(UUID registrationUuid) {
        Registration registration = registrationRepository.findByRegistrationUuid(registrationUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found for UUID: " + registrationUuid));

        return rosterPlayerRepository.findByTeamRegistrationId(registration.getRegistrationId());
    }

    public List<TeamEventRosterPlayer> getTeamRosterByRegistrationId(Long registrationId) {
        return rosterPlayerRepository.findByTeamRegistrationId(registrationId);
    }

    @Transactional
    public List<TeamEventRosterPlayer> addPlayersToRoster(UUID registrationUuid, List<TeamEventRosterPlayer> newPlayers, Long updatedBy) {
        Registration registration = registrationRepository.findByRegistrationUuid(registrationUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found for UUID: " + registrationUuid));

        // Note: the user mentioned we can fetch playerId by phoneNumber later. We skip it for now.
        List<TeamEventRosterPlayer> playersToSave = newPlayers.stream().map(p -> {
            p.setTeamRegistrationId(registration.getRegistrationId());
            p.setTournamentId(registration.getTournamentId());
            p.setCreatedBy(updatedBy);
            return p;
        }).collect(Collectors.toList());

        return rosterPlayerRepository.saveAll(playersToSave);
    }
}
