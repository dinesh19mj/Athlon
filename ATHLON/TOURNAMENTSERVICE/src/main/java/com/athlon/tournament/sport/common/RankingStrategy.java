package com.athlon.tournament.sport.common;

import com.athlon.tournament.ranking.entity.Ranking;
import com.athlon.tournament.statistics.entity.Statistic;

import java.util.List;

public interface RankingStrategy {
    List<Ranking> calculateRankings(List<Statistic> statistics);
}
