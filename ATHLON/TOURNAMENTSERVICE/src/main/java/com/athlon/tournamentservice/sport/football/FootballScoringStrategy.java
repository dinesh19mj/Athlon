package com.athlon.tournamentservice.sport.football;

import com.athlon.tournamentservice.score.entity.Score;
import com.athlon.tournamentservice.score.entity.ScoreEvent;
import com.athlon.tournamentservice.sport.common.ScoringStrategy;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class FootballScoringStrategy implements ScoringStrategy {

    @Override
    public Score calculateFinalScore(List<ScoreEvent> events, Long matchId) {
        // Football scoring logic
        return new Score(matchId, UUID.randomUUID(), "0", "0", true, 1L);
    }

    @Override
    public boolean isMatchComplete(Score score) {
        return score.isFinal();
    }
}

