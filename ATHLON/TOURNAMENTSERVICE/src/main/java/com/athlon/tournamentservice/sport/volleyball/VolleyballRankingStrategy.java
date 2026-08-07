package com.athlon.tournamentservice.sport.volleyball;

import com.athlon.tournamentservice.ranking.entity.Ranking;
import com.athlon.tournamentservice.sport.common.RankingStrategy;
import com.athlon.tournamentservice.statistics.entity.Statistic;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class VolleyballRankingStrategy implements RankingStrategy {

    @Override
    public List<Ranking> calculateRankings(List<Statistic> statistics) {
        return new ArrayList<>();
    }
}

