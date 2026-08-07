package com.athlon.tournamentservice.sport.badminton;

import com.athlon.tournamentservice.ranking.entity.Ranking;
import com.athlon.tournamentservice.sport.common.RankingStrategy;
import com.athlon.tournamentservice.statistics.entity.Statistic;
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

