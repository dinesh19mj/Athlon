package com.athlon.tournamentservice.sport.common;

import com.athlon.tournamentservice.score.entity.Score;
import com.athlon.tournamentservice.score.entity.ScoreEvent;

import java.util.List;

public interface ScoringStrategy {
    Score calculateFinalScore(List<ScoreEvent> events, Long matchId);
    boolean isMatchComplete(Score score);
}

