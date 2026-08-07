package com.athlon.tournamentservice.sport.common;

import com.athlon.tournamentservice.score.entity.Score;
import com.athlon.tournamentservice.statistics.entity.Statistic;

import java.util.List;

public interface StatisticsStrategy {
    Statistic updateStatistics(Statistic currentStat, List<Score> matchScores, Long registrationId);
}

