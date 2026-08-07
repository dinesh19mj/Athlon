package com.athlon.tournamentservice.sport.badminton;

import com.athlon.tournamentservice.score.entity.Score;
import com.athlon.tournamentservice.score.entity.ScoreEvent;
import com.athlon.tournamentservice.sport.common.ScoringStrategy;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class BadmintonScoringStrategy implements ScoringStrategy {

    @Override
    public Score calculateFinalScore(List<ScoreEvent> events, Long matchId) {
        // Basic badminton scoring logic placeholder
        Score score = new Score(matchId, UUID.randomUUID(), "0", "0", true, 1L);
        return score;
    }

    @Override
    public boolean isMatchComplete(Score score) {
        // e.g., first to 21, best of 3 sets
        return score.isFinal();
    }
}

