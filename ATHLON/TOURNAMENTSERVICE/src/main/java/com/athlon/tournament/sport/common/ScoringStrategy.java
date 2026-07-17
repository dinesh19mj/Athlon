package com.athlon.tournament.sport.common;

import com.athlon.tournament.score.entity.Score;
import com.athlon.tournament.score.entity.ScoreEvent;

import java.util.List;

public interface ScoringStrategy {
    Score calculateFinalScore(List<ScoreEvent> events, Long matchId);
    boolean isMatchComplete(Score score);
}
