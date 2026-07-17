package com.athlon.tournament.sport.football;

import com.athlon.tournament.score.entity.Score;
import com.athlon.tournament.sport.common.StatisticsStrategy;
import com.athlon.tournament.statistics.entity.Statistic;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FootballStatisticsStrategy implements StatisticsStrategy {

    @Override
    public Statistic updateStatistics(Statistic currentStat, List<Score> matchScores, Long registrationId) {
        // Calculate football specific stats like goals scored, goals conceded
        return currentStat;
    }
}
