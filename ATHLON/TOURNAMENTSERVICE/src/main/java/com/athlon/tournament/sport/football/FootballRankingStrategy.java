package com.athlon.tournament.sport.football;

import com.athlon.tournament.ranking.entity.Ranking;
import com.athlon.tournament.sport.common.RankingStrategy;
import com.athlon.tournament.statistics.entity.Statistic;
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
