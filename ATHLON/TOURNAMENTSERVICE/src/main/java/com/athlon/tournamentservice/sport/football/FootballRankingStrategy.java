package com.athlon.tournamentservice.sport.football;

import com.athlon.tournamentservice.ranking.entity.Ranking;
import com.athlon.tournamentservice.sport.common.RankingStrategy;
import com.athlon.tournamentservice.statistics.entity.Statistic;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class FootballRankingStrategy implements RankingStrategy {

    @Override
    public List<Ranking> calculateRankings(List<Statistic> statistics) {
        // Football ranking logic based on points, goal difference
        return new ArrayList<>();
    }
}

