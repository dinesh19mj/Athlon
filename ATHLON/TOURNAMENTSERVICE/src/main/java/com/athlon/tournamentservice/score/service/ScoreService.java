package com.athlon.tournamentservice.score.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.tournamentservice.score.entity.Score;
import com.athlon.tournamentservice.score.entity.ScoreEvent;
import com.athlon.tournamentservice.score.repository.ScoreEventRepository;
import com.athlon.tournamentservice.score.repository.ScoreRepository;
import com.athlon.tournamentservice.sport.SportEngine;
import com.athlon.tournamentservice.sport.common.ScoringStrategy;
import com.athlon.tournamentservice.match.repository.MatchRepository;
import com.athlon.tournamentservice.match.entity.Match;
import com.athlon.tournamentservice.teamevent.repository.TeamEventCategoryMatchRepository;
import com.athlon.tournamentservice.teamevent.entity.TeamEventCategoryMatch;
import java.util.UUID;

@Service
public class ScoreService {

    private final ScoreRepository scoreRepository;
    private final ScoreEventRepository scoreEventRepository;
    private final SportEngine sportEngine;
    private final MatchRepository matchRepository;
    private final TeamEventCategoryMatchRepository teamEventCategoryMatchRepository;

    public ScoreService(ScoreRepository scoreRepository, ScoreEventRepository scoreEventRepository, SportEngine sportEngine, MatchRepository matchRepository, TeamEventCategoryMatchRepository teamEventCategoryMatchRepository) {
        this.scoreRepository = scoreRepository;
        this.scoreEventRepository = scoreEventRepository;
        this.sportEngine = sportEngine;
        this.matchRepository = matchRepository;
        this.teamEventCategoryMatchRepository = teamEventCategoryMatchRepository;
    }

    private Long getMatchIdFromUuid(String matchUuid) {
        try {
            UUID uuid = parseUuid(matchUuid);
            return matchRepository.findByMatchUuid(uuid)
                    .map(Match::getMatchId)
                    .orElseGet(() -> teamEventCategoryMatchRepository.findByUuid(uuid)
                            .map(TeamEventCategoryMatch::getId)
                            .orElse(0L));
        } catch (Exception e) {
            return 0L;
        }
    }

    private UUID parseUuid(String matchUuid) {
        try {
            return UUID.fromString(matchUuid);
        } catch (Exception e) {
            return UUID.nameUUIDFromBytes(matchUuid.getBytes());
        }
    }

    @Transactional
    public Score recordScoreEvent(String matchUuid, ScoreEvent event, String sportType) {
        Long matchId = getMatchIdFromUuid(matchUuid);
        UUID uuid = parseUuid(matchUuid);
        
        Score score = scoreRepository.findByMatchUuidAndIsActiveTrue(uuid).orElseGet(() -> {
            Score newScore = new Score();
            newScore.setMatchId(matchId != null ? matchId : 0L);
            newScore.setMatchUuid(uuid);
            return scoreRepository.save(newScore);
        });

        event.setScoreId(score.getScoreId());
        event.setScoreUuid(score.getScoreUuid());
        scoreEventRepository.save(event);

        return score;
    }

    public Score getScoreState(String matchUuid) {
        UUID uuid = parseUuid(matchUuid);
        java.util.Optional<Score> scoreOpt = scoreRepository.findByMatchUuidAndIsActiveTrue(uuid);
        if (scoreOpt.isEmpty()) {
            Long matchId = getMatchIdFromUuid(matchUuid);
            if (matchId != null && matchId > 0) {
                scoreOpt = scoreRepository.findByMatchIdAndIsActiveTrue(matchId);
            }
        }
        return scoreOpt.orElse(null);
    }

    @Transactional
    public Score syncScoreState(String matchUuid, com.fasterxml.jackson.databind.JsonNode state) {
        Long matchId = getMatchIdFromUuid(matchUuid);
        UUID uuid = parseUuid(matchUuid);
        
        java.util.Optional<Score> existingOpt = scoreRepository.findByMatchUuidAndIsActiveTrue(uuid);
        if (existingOpt.isEmpty() && matchId != null && matchId > 0) {
            existingOpt = scoreRepository.findByMatchIdAndIsActiveTrue(matchId);
        }

        Score score = existingOpt.orElseGet(() -> {
            Score newScore = new Score();
            newScore.setMatchId(matchId != null ? matchId : 0L);
            newScore.setMatchUuid(uuid);
            return newScore;
        });
        
        if (score.getMatchUuid() == null) {
            score.setMatchUuid(uuid);
        }
        if (matchId != null && matchId > 0 && (score.getMatchId() == null || score.getMatchId() == 0L)) {
            score.setMatchId(matchId);
        }

        score.setScoreMeta(state);

        if (state != null) {
            if (state.has("teamAScore") && !state.get("teamAScore").isNull()) {
                score.setTeamAScore(state.get("teamAScore").asText());
            }
            if (state.has("teamBScore") && !state.get("teamBScore").isNull()) {
                score.setTeamBScore(state.get("teamBScore").asText());
            }
            if (state.has("isFinal") && state.get("isFinal").asBoolean()) {
                score.setFinal(true);
                if (uuid != null) {
                    matchRepository.findByMatchUuid(uuid).ifPresent(m -> {
                        String matchWinner = state.has("matchWinner") && !state.get("matchWinner").isNull() ? state.get("matchWinner").asText() : null;
                        Long winnerRegId = "A".equalsIgnoreCase(matchWinner) ? m.getTeamARegistrationId() : ("B".equalsIgnoreCase(matchWinner) ? m.getTeamBRegistrationId() : null);
                        UUID winnerRegUuid = "A".equalsIgnoreCase(matchWinner) ? m.getTeamARegistrationUuid() : ("B".equalsIgnoreCase(matchWinner) ? m.getTeamBRegistrationUuid() : null);
                        
                        m.setStatus("COMPLETED");
                        if (winnerRegId != null) m.setWinnerRegistrationId(winnerRegId);
                        if (winnerRegUuid != null) m.setWinnerRegistrationUuid(winnerRegUuid);
                        matchRepository.save(m);

                        if (m.getNextMatchUuid() != null && m.getWinnerRegistrationId() != null) {
                            advanceWinnerToNextMatch(m);
                        }
                    });
                }
            }
        }

        return scoreRepository.save(score);
    }

    private void advanceWinnerToNextMatch(Match completedMatch) {
        UUID nextMatchUuid = completedMatch.getNextMatchUuid();
        if (nextMatchUuid == null) return;

        matchRepository.findByMatchUuid(nextMatchUuid).ifPresent(nextMatch -> {
            Long winnerId = completedMatch.getWinnerRegistrationId();
            UUID winnerUuid = completedMatch.getWinnerRegistrationUuid();

            List<Match> feeders = matchRepository.findByNextMatchUuid(nextMatchUuid);
            feeders.sort((a, b) -> a.getMatchId().compareTo(b.getMatchId()));

            if (feeders.size() >= 2) {
                if (feeders.get(0).getMatchUuid().equals(completedMatch.getMatchUuid())) {
                    nextMatch.setTeamARegistrationId(winnerId);
                    nextMatch.setTeamARegistrationUuid(winnerUuid);
                } else {
                    nextMatch.setTeamBRegistrationId(winnerId);
                    nextMatch.setTeamBRegistrationUuid(winnerUuid);
                }
            } else {
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

    public List<Score> getLiveScores() {
        return scoreRepository.findByIsFinalFalseAndIsActiveTrue();
    }

    public List<Score> getAllScores() {
        return scoreRepository.findByIsActiveTrue();
    }
}

