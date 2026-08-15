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
        UUID uuid = UUID.fromString(matchUuid);
        return matchRepository.findByMatchUuid(uuid)
                .map(Match::getMatchId)
                .orElseGet(() -> teamEventCategoryMatchRepository.findByUuid(uuid)
                        .map(TeamEventCategoryMatch::getId)
                        .orElseThrow(() -> new RuntimeException("Match not found: " + matchUuid)));
    }

    @Transactional
    public Score recordScoreEvent(String matchUuid, ScoreEvent event, String sportType) {
        Long matchId = getMatchIdFromUuid(matchUuid);
        
        Score score = scoreRepository.findByMatchUuidAndIsActiveTrue(UUID.fromString(matchUuid)).orElseGet(() -> {
            Score newScore = new Score();
            newScore.setMatchId(matchId);
            newScore.setMatchUuid(UUID.fromString(matchUuid));
            return scoreRepository.save(newScore);
        });

        event.setScoreId(score.getScoreId());
        event.setScoreUuid(score.getScoreUuid());
        scoreEventRepository.save(event);

        List<ScoreEvent> matchEvents = scoreEventRepository.findByScoreIdAndIsActiveTrue(score.getScoreId());
        
        ScoringStrategy scoringStrategy = sportEngine.getStrategy(sportType).getScoringStrategy();
        Score calculatedScore = scoringStrategy.calculateFinalScore(matchEvents, matchId);
        
        calculatedScore.setScoreId(score.getScoreId());
        calculatedScore.setScoreUuid(score.getScoreUuid());
        calculatedScore.setScoreMeta(score.getScoreMeta()); // preserve meta
        
        return scoreRepository.save(calculatedScore);
    }

    public Score getScoreState(String matchUuid) {
        return scoreRepository.findByMatchUuidAndIsActiveTrue(UUID.fromString(matchUuid)).orElse(null);
    }

    @Transactional
    public Score syncScoreState(String matchUuid, com.fasterxml.jackson.databind.JsonNode state) {
        Long matchId = getMatchIdFromUuid(matchUuid);
        
        Score score = scoreRepository.findByMatchUuidAndIsActiveTrue(UUID.fromString(matchUuid)).orElseGet(() -> {
            Score newScore = new Score();
            newScore.setMatchId(matchId);
            newScore.setMatchUuid(UUID.fromString(matchUuid));
            return newScore;
        });
        
        score.setScoreMeta(state);
        return scoreRepository.save(score);
    }
}

