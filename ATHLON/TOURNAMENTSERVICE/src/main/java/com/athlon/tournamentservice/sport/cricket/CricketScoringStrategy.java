package com.athlon.tournamentservice.sport.cricket;

import com.athlon.tournamentservice.score.entity.Score;
import com.athlon.tournamentservice.score.entity.ScoreEvent;
import com.athlon.tournamentservice.sport.common.ScoringStrategy;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class CricketScoringStrategy implements ScoringStrategy {

    @Override
    public Score calculateFinalScore(List<ScoreEvent> events, Long matchId) {
        return new Score(matchId, UUID.randomUUID(), "0/0", "0/0", true, 1L);
    }

    @Override
    public boolean isMatchComplete(Score score) {
        return score.isFinal();
    }
}

