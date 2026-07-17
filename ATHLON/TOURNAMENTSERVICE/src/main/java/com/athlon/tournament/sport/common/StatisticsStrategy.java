package com.athlon.tournament.sport.common;

import com.athlon.tournament.score.entity.Score;
import com.athlon.tournament.statistics.entity.Statistic;

import java.util.List;

public interface StatisticsStrategy {
    Statistic updateStatistics(Statistic currentStat, List<Score> matchScores, Long registrationId);
}
