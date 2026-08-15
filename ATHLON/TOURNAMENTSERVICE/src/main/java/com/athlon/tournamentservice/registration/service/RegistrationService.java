package com.athlon.tournamentservice.registration.service;

import com.athlon.tournamentservice.dto.request.RegistrationCreateRequest;
import com.athlon.tournamentservice.dto.response.RegistrationResponse;
import com.athlon.tournamentservice.exception.ResourceNotFoundException;
import com.athlon.tournamentservice.registration.entity.Registration;
import com.athlon.tournamentservice.registration.entity.RegistrationPlayer;
import com.athlon.tournamentservice.registration.repository.RegistrationRepository;
import com.athlon.tournamentservice.registration.repository.RegistrationPlayerRepository;
import com.athlon.tournamentservice.dto.request.PlayerRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.athlon.tournamentservice.dto.response.PlayerResponse;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final RegistrationPlayerRepository registrationPlayerRepository;

    public RegistrationService(RegistrationRepository registrationRepository, RegistrationPlayerRepository registrationPlayerRepository) {
        this.registrationRepository = registrationRepository;
        this.registrationPlayerRepository = registrationPlayerRepository;
    }

    @Transactional
    public RegistrationResponse createRegistration(RegistrationCreateRequest request) {
        Registration registration = new Registration(
                request.getTournamentId(),
                request.getTournamentUuid(),
                request.getCategoryId(),
                request.getCategoryUuid(),
                request.getTeamName(),
                request.getPrimaryContactId(),
                request.getPrimaryContactUuid(),
                request.getCreatedBy()
        );

        Registration saved = registrationRepository.save(registration);

        if (request.getPlayers() != null && !request.getPlayers().isEmpty()) {
            for (PlayerRequest playerRequest : request.getPlayers()) {
                RegistrationPlayer registrationPlayer = new RegistrationPlayer(
                        saved.getRegistrationId(),
                        saved.getRegistrationUuid(),
                        saved.getTournamentId(),
                        saved.getTournamentUuid(),
                        playerRequest.getPlayerId(),
                        playerRequest.getPlayerUuid(),
                        playerRequest.getPlayerName(),
                        playerRequest.getPhoneNumber(),
                        request.getCreatedBy()
                );
                registrationPlayerRepository.save(registrationPlayer);
            }
        }

        return RegistrationResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getRegistrationsByCategory(Long categoryId) {
        return registrationRepository.findByCategoryIdAndStatus(categoryId, "ACTIVE").stream()
                .map(this::mapRegistrationToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getRegistrationsByTournament(Long tournamentId) {
        return registrationRepository.findByTournamentId(tournamentId).stream()
                .map(this::mapRegistrationToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getRegistrationsByUser(Long userId) {
        return registrationRepository.findByCreatedBy(userId).stream()
                .map(this::mapRegistrationToResponse)
                .collect(Collectors.toList());
    }

    private RegistrationResponse mapRegistrationToResponse(Registration registration) {
        List<RegistrationPlayer> players = registrationPlayerRepository.findByRegistrationId(registration.getRegistrationId());
        List<PlayerResponse> playerResponses = players.stream()
                .map(PlayerResponse::fromEntity)
                .collect(Collectors.toList());
        return RegistrationResponse.fromEntity(registration, playerResponses);
    }

    @Transactional(readOnly = true)
    public RegistrationResponse getRegistrationByUuid(UUID uuid) {
        Registration registration = registrationRepository.findByRegistrationUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found with UUID: " + uuid));
        return mapRegistrationToResponse(registration);
    }

    @Transactional
    public RegistrationResponse updateStatus(UUID uuid, String status, Long updatedBy) {
        Registration registration = registrationRepository.findByRegistrationUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found with UUID: " + uuid));
        registration.setStatus(status);
        if (updatedBy != null) registration.setUpdatedBy(updatedBy);
        Registration saved = registrationRepository.save(registration);
        return mapRegistrationToResponse(saved);
    }

    @Transactional
    public RegistrationResponse updatePaymentStatus(UUID uuid, String paymentStatus, Long updatedBy) {
        Registration registration = registrationRepository.findByRegistrationUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found with UUID: " + uuid));
        registration.setPaymentStatus(paymentStatus);
        if (updatedBy != null) registration.setUpdatedBy(updatedBy);
        Registration saved = registrationRepository.save(registration);
        return mapRegistrationToResponse(saved);
    }

    @Transactional
    public RegistrationResponse addPlayersToRegistration(UUID uuid, List<PlayerRequest> newPlayers, Long updatedBy) {
        Registration registration = registrationRepository.findByRegistrationUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found with UUID: " + uuid));

        if (newPlayers != null && !newPlayers.isEmpty()) {
            for (PlayerRequest playerRequest : newPlayers) {
                RegistrationPlayer registrationPlayer = new RegistrationPlayer(
                        registration.getRegistrationId(),
                        registration.getRegistrationUuid(),
                        registration.getTournamentId(),
                        registration.getTournamentUuid(),
                        playerRequest.getPlayerId(),
                        playerRequest.getPlayerUuid(),
                        playerRequest.getPlayerName(),
                        playerRequest.getPhoneNumber(),
                        updatedBy
                );
                registrationPlayerRepository.save(registrationPlayer);
            }
        }
        
        if (updatedBy != null) registration.setUpdatedBy(updatedBy);
        registrationRepository.save(registration);

        return mapRegistrationToResponse(registration);
    }
}

