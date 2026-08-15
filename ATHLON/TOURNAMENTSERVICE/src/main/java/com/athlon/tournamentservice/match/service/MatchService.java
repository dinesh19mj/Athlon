package com.athlon.tournamentservice.match.service;

import com.athlon.tournamentservice.dto.request.MatchCreateRequest;
import com.athlon.tournamentservice.dto.response.MatchResponse;
import com.athlon.tournamentservice.exception.ResourceNotFoundException;
import com.athlon.tournamentservice.match.entity.Match;
import com.athlon.tournamentservice.match.repository.MatchRepository;
import com.athlon.tournamentservice.sport.SportEngine;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.athlon.tournamentservice.registration.repository.RegistrationRepository;
import com.athlon.tournamentservice.teamevent.repository.TeamEventLineupRepository;
import com.athlon.tournamentservice.tournament.repository.TournamentRepository;
import com.athlon.tournamentservice.streaming.repository.TournamentStreamConfigRepository;
import com.athlon.tournamentservice.tournament.entity.Tournament;
import com.athlon.tournamentservice.streaming.entity.TournamentStreamConfig;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final SportEngine sportEngine;
    private final RegistrationRepository registrationRepository;
    private final TeamEventLineupRepository teamEventLineupRepository;
    private final TournamentRepository tournamentRepository;
    private final TournamentStreamConfigRepository streamConfigRepository;

    public MatchService(MatchRepository matchRepository, SportEngine sportEngine, RegistrationRepository registrationRepository, TeamEventLineupRepository teamEventLineupRepository, TournamentRepository tournamentRepository, TournamentStreamConfigRepository streamConfigRepository) {
        this.matchRepository = matchRepository;
        this.sportEngine = sportEngine;
        this.registrationRepository = registrationRepository;
        this.teamEventLineupRepository = teamEventLineupRepository;
        this.tournamentRepository = tournamentRepository;
        this.streamConfigRepository = streamConfigRepository;
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
        return populateTeamNames(MatchResponse.fromEntity(saved));
    }

    @Transactional(readOnly = true)
    public MatchResponse getMatchByUuid(UUID uuid) {
        Match match = matchRepository.findByMatchUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with UUID: " + uuid));
        return populateTeamNames(MatchResponse.fromEntity(match));
    }

    @Transactional(readOnly = true)
    public java.util.List<MatchResponse> getMatchesByTournament(UUID tournamentUuid) {
        return matchRepository.findByTournamentUuid(tournamentUuid).stream()
                .map(MatchResponse::fromEntity)
                .map(this::populateTeamNames)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getMatchesByUser(Long userId) {
        return matchRepository.findMatchesByUserId(userId).stream()
                .map(MatchResponse::fromEntity)
                .map(this::populateTeamNames)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getMatchesByUmpirePhone(String phone) {
        return matchRepository.findByUmpirePhone(phone).stream()
                .map(MatchResponse::fromEntity)
                .map(this::populateTeamNames)
                .collect(Collectors.toList());
    }

    public MatchResponse updateMatchCourt(UUID uuid, Long courtId) {
        Match match = matchRepository.findByMatchUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with UUID: " + uuid));
        match.setCourtId(courtId);
        Match updatedMatch = matchRepository.save(match);
        return populateTeamNames(MatchResponse.fromEntity(updatedMatch));
    }

    public MatchResponse updateMatchUmpire(UUID uuid, String umpirePhone) {
        Match match = matchRepository.findByMatchUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with UUID: " + uuid));
        match.setUmpirePhone(umpirePhone);
        Match updatedMatch = matchRepository.save(match);
        return populateTeamNames(MatchResponse.fromEntity(updatedMatch));
    }

    public MatchResponse updateMatchScheduledTime(UUID uuid, java.time.LocalDateTime scheduledTime) {
        Match match = matchRepository.findByMatchUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with UUID: " + uuid));
        match.setScheduledTime(scheduledTime);
        Match updatedMatch = matchRepository.save(match);
        return populateTeamNames(MatchResponse.fromEntity(updatedMatch));
    }

    @Transactional
    public MatchResponse updateMatchStatus(UUID uuid, String status, Long winnerRegistrationId) {
        Match match = matchRepository.findByMatchUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with UUID: " + uuid));
        match.setStatus(status);
        if (winnerRegistrationId != null) {
            match.setWinnerRegistrationId(winnerRegistrationId);
            registrationRepository.findById(winnerRegistrationId)
                    .ifPresent(reg -> match.setWinnerRegistrationUuid(reg.getRegistrationUuid()));
        }
        Match updatedMatch = matchRepository.save(match);

        // Advance winner into next round match in the draw / fixture bracket
        if ("COMPLETED".equalsIgnoreCase(status) && updatedMatch.getWinnerRegistrationId() != null && updatedMatch.getNextMatchUuid() != null) {
            advanceWinnerToNextMatch(updatedMatch);
        }

        return populateTeamNames(MatchResponse.fromEntity(updatedMatch));
    }

    private void advanceWinnerToNextMatch(Match completedMatch) {
        UUID nextMatchUuid = completedMatch.getNextMatchUuid();
        if (nextMatchUuid == null) return;

        matchRepository.findByMatchUuid(nextMatchUuid).ifPresent(nextMatch -> {
            Long winnerId = completedMatch.getWinnerRegistrationId();
            UUID winnerUuid = completedMatch.getWinnerRegistrationUuid();

            // Find all sibling feeder matches leading into this next match
            List<Match> feeders = matchRepository.findByNextMatchUuid(nextMatchUuid);
            feeders.sort((a, b) -> a.getMatchId().compareTo(b.getMatchId()));

            if (feeders.size() >= 2) {
                if (feeders.get(0).getMatchUuid().equals(completedMatch.getMatchUuid())) {
                    // Left branch child -> Team A in next round
                    nextMatch.setTeamARegistrationId(winnerId);
                    nextMatch.setTeamARegistrationUuid(winnerUuid);
                } else {
                    // Right branch child -> Team B in next round
                    nextMatch.setTeamBRegistrationId(winnerId);
                    nextMatch.setTeamBRegistrationUuid(winnerUuid);
                }
            } else {
                // Single feeder or fallback
                if (nextMatch.getTeamARegistrationId() == null || nextMatch.getTeamARegistrationId().equals(winnerId)) {
                    nextMatch.setTeamARegistrationId(winnerId);
                    nextMatch.setTeamARegistrationUuid(winnerUuid);
                } else {
                    nextMatch.setTeamBRegistrationId(winnerId);
                    nextMatch.setTeamBRegistrationUuid(winnerUuid);
                }
            }
            matchRepository.save(nextMatch);
        });
    }

    private MatchResponse populateTeamNames(MatchResponse response) {
        if (response == null) return null;
        if (response.getTeamARegistrationId() != null) {
            registrationRepository.findById(response.getTeamARegistrationId())
                    .ifPresent(reg -> response.setTeamAName(reg.getTeamName()));
            teamEventLineupRepository.findByFixtureMatchIdAndTeamRegistrationId(response.getId(), response.getTeamARegistrationId())
                    .ifPresent(lineup -> response.setTeamALineupStatus(lineup.getStatus()));
        }
        if (response.getTeamBRegistrationId() != null) {
            registrationRepository.findById(response.getTeamBRegistrationId())
                    .ifPresent(reg -> response.setTeamBName(reg.getTeamName()));
            teamEventLineupRepository.findByFixtureMatchIdAndTeamRegistrationId(response.getId(), response.getTeamBRegistrationId())
                    .ifPresent(lineup -> response.setTeamBLineupStatus(lineup.getStatus()));
        }
        if (response.getTournamentId() != null) {
            tournamentRepository.findById(response.getTournamentId())
                    .ifPresent(t -> {
                        response.setTournamentName(t.getName());
                        response.setSportType(t.getSport());
                        response.setTournamentType(t.getTournamentType());
                    });
        }
        if (response.getCourtId() != null) {
            streamConfigRepository.findById(response.getCourtId())
                    .ifPresent(c -> response.setCourtName(c.getCourtName()));
        }

        return response;
    }
}
