package com.athlon.tournament.sport.cricket;

import com.athlon.tournament.ranking.entity.Ranking;
import com.athlon.tournament.sport.common.RankingStrategy;
import com.athlon.tournament.statistics.entity.Statistic;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CricketRankingStrategy implements RankingStrategy {

    @Override
    public List<Ranking> calculateRankings(List<Statistic> statistics) {
        return new ArrayList<>();
    }
}
