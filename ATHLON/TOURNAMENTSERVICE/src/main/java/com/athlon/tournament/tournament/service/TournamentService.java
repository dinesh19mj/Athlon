package com.athlon.tournament.tournament.service;

import com.athlon.tournament.dto.request.TournamentCreateRequest;
import com.athlon.tournament.dto.response.TournamentResponse;
import com.athlon.tournament.exception.ResourceNotFoundException;
import com.athlon.tournament.tournament.entity.Tournament;
import com.athlon.tournament.tournament.repository.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TournamentService {

    private final TournamentRepository tournamentRepository;

    public TournamentService(TournamentRepository tournamentRepository) {
        this.tournamentRepository = tournamentRepository;
    }

    @Transactional
    public TournamentResponse createTournament(TournamentCreateRequest request) {
        Tournament tournament = new Tournament(
                request.getName(),
                request.getDescription(),
                request.getStartDate(),
                request.getEndDate(),
                request.getOrganizerId(),
                request.getOrganizerUuid(),
                request.getCreatedBy()
        );

        Tournament saved = tournamentRepository.save(tournament);
        return TournamentResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public TournamentResponse getTournamentByUuid(UUID uuid) {
        Tournament tournament = tournamentRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found with UUID: " + uuid));
        return TournamentResponse.fromEntity(tournament);
    }

    @Transactional(readOnly = true)
    public List<TournamentResponse> getAllActiveTournaments() {
        return tournamentRepository.findAll().stream()
                .filter(Tournament::isActive)
                .map(TournamentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deactivateTournament(UUID uuid) {
        Tournament tournament = tournamentRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found with UUID: " + uuid));
        tournament.setActive(false);
        tournamentRepository.save(tournament);
    }
}
