package com.athlon.tournament.sport.volleyball;

import com.athlon.tournament.score.entity.Score;
import com.athlon.tournament.sport.common.StatisticsStrategy;
import com.athlon.tournament.statistics.entity.Statistic;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class VolleyballStatisticsStrategy implements StatisticsStrategy {

    @Override
    public Statistic updateStatistics(Statistic currentStat, List<Score> matchScores, Long registrationId) {
        return currentStat;
    }
}
