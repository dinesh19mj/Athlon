package com.athlon.tournament.score.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.tournament.score.entity.Score;
import com.athlon.tournament.score.entity.ScoreEvent;
import com.athlon.tournament.score.repository.ScoreEventRepository;
import com.athlon.tournament.score.repository.ScoreRepository;
import com.athlon.tournament.sport.SportEngine;
import com.athlon.tournament.sport.common.ScoringStrategy;

@Service
public class ScoreService {

    private final ScoreRepository scoreRepository;
    private final ScoreEventRepository scoreEventRepository;
    private final SportEngine sportEngine;

    public ScoreService(ScoreRepository scoreRepository, ScoreEventRepository scoreEventRepository, SportEngine sportEngine) {
        this.scoreRepository = scoreRepository;
        this.scoreEventRepository = scoreEventRepository;
        this.sportEngine = sportEngine;
    }

    @Transactional
    public Score recordScoreEvent(Long matchId, ScoreEvent event, String sportType) {
        scoreEventRepository.save(event);

        List<ScoreEvent> matchEvents = scoreEventRepository.findByScoreIdAndIsActiveTrue(event.getScoreId());
        
        ScoringStrategy scoringStrategy = sportEngine.getStrategy(sportType).getScoringStrategy();
        Score calculatedScore = scoringStrategy.calculateFinalScore(matchEvents, matchId);
        
        return scoreRepository.save(calculatedScore);
    }
}
