package com.athlon.tournamentservice.registration.service;

import com.athlon.tournamentservice.dto.request.RegistrationCreateRequest;
import com.athlon.tournamentservice.dto.response.RegistrationResponse;
import com.athlon.tournamentservice.exception.BadRequestException;
import com.athlon.tournamentservice.exception.ResourceNotFoundException;
import com.athlon.tournamentservice.match.entity.Match;
import com.athlon.tournamentservice.match.repository.MatchRepository;
import com.athlon.tournamentservice.registration.entity.Registration;
import com.athlon.tournamentservice.registration.entity.RegistrationPlayer;
import com.athlon.tournamentservice.registration.repository.RegistrationRepository;
import com.athlon.tournamentservice.registration.repository.RegistrationPlayerRepository;
import com.athlon.tournamentservice.tournament.repository.TournamentRepository;
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
    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;

    public RegistrationService(RegistrationRepository registrationRepository,
                               RegistrationPlayerRepository registrationPlayerRepository,
                               MatchRepository matchRepository,
                               TournamentRepository tournamentRepository) {
        this.registrationRepository = registrationRepository;
        this.registrationPlayerRepository = registrationPlayerRepository;
        this.matchRepository = matchRepository;
        this.tournamentRepository = tournamentRepository;
    }

    @Transactional
    public RegistrationResponse createRegistration(RegistrationCreateRequest request) {
        if (!"ORGANIZER_MANUAL".equalsIgnoreCase(request.getRegistrationSource())) {
            if (request.getTournamentUuid() != null) {
                tournamentRepository.findByTournamentUuid(request.getTournamentUuid()).ifPresent(t -> {
                    if ("ORGANIZER_MANAGED".equalsIgnoreCase(t.getRegistrationMode()) || "ORGANIZER_MANUAL".equalsIgnoreCase(t.getRegistrationMode())) {
                        throw new BadRequestException("Online public registration is not enabled for this tournament. Participants are managed directly by the organizer.");
                    }
                });
            } else if (request.getTournamentId() != null) {
                tournamentRepository.findById(request.getTournamentId()).ifPresent(t -> {
                    if ("ORGANIZER_MANAGED".equalsIgnoreCase(t.getRegistrationMode()) || "ORGANIZER_MANUAL".equalsIgnoreCase(t.getRegistrationMode())) {
                        throw new BadRequestException("Online public registration is not enabled for this tournament. Participants are managed directly by the organizer.");
                    }
                });
            }
        }

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

        if (request.getPlace() != null) {
            registration.setPlace(request.getPlace());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            registration.setStatus(request.getStatus());
        }
        if (request.getPaymentStatus() != null && !request.getPaymentStatus().isBlank()) {
            registration.setPaymentStatus(request.getPaymentStatus());
        }
        if (request.getRegistrationSource() != null && !request.getRegistrationSource().isBlank()) {
            registration.setRegistrationSource(request.getRegistrationSource());
        }
        if (request.getGender() != null && !request.getGender().isBlank()) {
            registration.setGender(request.getGender());
        }

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

        return mapRegistrationToResponse(saved);
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

    @Transactional
    public void deleteRegistration(UUID uuid, Long updatedBy) {
        Registration registration = registrationRepository.findByRegistrationUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found with UUID: " + uuid));

        // Validate against in-progress or completed matches
        if (registration.getTournamentUuid() != null) {
            List<Match> matches = matchRepository.findByTournamentUuid(registration.getTournamentUuid());
            for (Match m : matches) {
                boolean isTeamA = (m.getTeamARegistrationId() != null && m.getTeamARegistrationId().equals(registration.getRegistrationId()))
                        || (m.getTeamARegistrationUuid() != null && m.getTeamARegistrationUuid().equals(registration.getRegistrationUuid()));
                boolean isTeamB = (m.getTeamBRegistrationId() != null && m.getTeamBRegistrationId().equals(registration.getRegistrationId()))
                        || (m.getTeamBRegistrationUuid() != null && m.getTeamBRegistrationUuid().equals(registration.getRegistrationUuid()));

                if (isTeamA || isTeamB) {
                    if ("IN_PROGRESS".equalsIgnoreCase(m.getStatus()) || "COMPLETED".equalsIgnoreCase(m.getStatus())) {
                        throw new IllegalStateException("Cannot delete participant because match results or scoring has already started for this participant.");
                    }
                }
            }
        }

        registrationPlayerRepository.deleteByRegistrationId(registration.getRegistrationId());
        registrationRepository.delete(registration);
    }

    @Transactional
    public RegistrationResponse updateRegistration(UUID uuid, RegistrationCreateRequest request, Long updatedBy) {
        Registration registration = registrationRepository.findByRegistrationUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found with UUID: " + uuid));

        if (request.getTeamName() != null && !request.getTeamName().isBlank()) {
            registration.setTeamName(request.getTeamName());
        }
        if (request.getPlace() != null) {
            registration.setPlace(request.getPlace());
        }
        if (request.getCategoryId() != null) {
            registration.setCategoryId(request.getCategoryId());
        }
        if (request.getCategoryUuid() != null) {
            registration.setCategoryUuid(request.getCategoryUuid());
        }
        if (request.getGender() != null) {
            registration.setGender(request.getGender());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            registration.setStatus(request.getStatus());
        }
        if (request.getPaymentStatus() != null && !request.getPaymentStatus().isBlank()) {
            registration.setPaymentStatus(request.getPaymentStatus());
        }
        if (updatedBy != null) {
            registration.setUpdatedBy(updatedBy);
        }

        if (request.getPlayers() != null && !request.getPlayers().isEmpty()) {
            registrationPlayerRepository.deleteByRegistrationId(registration.getRegistrationId());
            for (PlayerRequest playerRequest : request.getPlayers()) {
                RegistrationPlayer registrationPlayer = new RegistrationPlayer(
                        registration.getRegistrationId(),
                        registration.getRegistrationUuid(),
                        registration.getTournamentId(),
                        registration.getTournamentUuid(),
                        playerRequest.getPlayerId(),
                        playerRequest.getPlayerUuid(),
                        playerRequest.getPlayerName(),
                        playerRequest.getPhoneNumber(),
                        updatedBy != null ? updatedBy : request.getCreatedBy()
                );
                registrationPlayerRepository.save(registrationPlayer);
            }
        }

        Registration saved = registrationRepository.save(registration);
        return mapRegistrationToResponse(saved);
    }
}

