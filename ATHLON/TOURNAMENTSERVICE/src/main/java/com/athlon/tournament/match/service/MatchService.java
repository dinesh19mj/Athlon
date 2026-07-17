package com.athlon.tournament.match.service;

import com.athlon.tournament.dto.request.MatchCreateRequest;
import com.athlon.tournament.dto.response.MatchResponse;
import com.athlon.tournament.exception.ResourceNotFoundException;
import com.athlon.tournament.match.entity.Match;
import com.athlon.tournament.match.repository.MatchRepository;
import com.athlon.tournament.sport.SportEngine;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final SportEngine sportEngine;

    public MatchService(MatchRepository matchRepository, SportEngine sportEngine) {
        this.matchRepository = matchRepository;
        this.sportEngine = sportEngine;
    }

    @Transactional
    public MatchResponse createMatch(MatchCreateRequest request) {
        Match match = new Match(
                request.getTeamARegistrationId(),
                request.getTeamARegistrationUuid(),
                request.getTeamBRegistrationId(),
                request.getTeamBRegistrationUuid(),
                request.getCourtId(),
                request.getCourtUuid(),
                request.getScheduledTime(),
                request.getCreatedBy()
        );

        Match saved = matchRepository.save(match);
        return MatchResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public MatchResponse getMatchByUuid(UUID uuid) {
        Match match = matchRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with UUID: " + uuid));
        return MatchResponse.fromEntity(match);
    }

    // Example of using SportEngine inside a Match processing flow could be added here
}
