package com.athlon.tournamentservice.sport.badminton;

import com.athlon.tournamentservice.score.entity.Score;
import com.athlon.tournamentservice.sport.common.StatisticsStrategy;
import com.athlon.tournamentservice.statistics.entity.Statistic;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BadmintonStatisticsStrategy implements StatisticsStrategy {

    @Override
    public Statistic updateStatistics(Statistic currentStat, List<Score> matchScores, Long registrationId) {
        // Calculate badminton specific stats like points, sets won/lost
        return currentStat;
    }
}

