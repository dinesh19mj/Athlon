package com.athlon.tournament.sport.volleyball;

import com.athlon.tournament.score.entity.Score;
import com.athlon.tournament.score.entity.ScoreEvent;
import com.athlon.tournament.sport.common.ScoringStrategy;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class VolleyballScoringStrategy implements ScoringStrategy {

    @Override
    public Score calculateFinalScore(List<ScoreEvent> events, Long matchId) {
        return new Score(matchId, UUID.randomUUID(), "0", "0", true, 1L);
    }

    @Override
    public boolean isMatchComplete(Score score) {
        return score.isFinal();
    }
}
