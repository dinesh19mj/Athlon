package com.athlon.tournament.sport.badminton;

import com.athlon.tournament.ranking.entity.Ranking;
import com.athlon.tournament.sport.common.RankingStrategy;
import com.athlon.tournament.statistics.entity.Statistic;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class BadmintonRankingStrategy implements RankingStrategy {

    @Override
    public List<Ranking> calculateRankings(List<Statistic> statistics) {
        // Badminton ranking logic based on points or sets won
        return new ArrayList<>();
    }
}
