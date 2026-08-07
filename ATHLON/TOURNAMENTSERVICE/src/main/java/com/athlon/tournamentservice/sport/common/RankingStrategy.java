package com.athlon.tournamentservice.sport.common;

import com.athlon.tournamentservice.ranking.entity.Ranking;
import com.athlon.tournamentservice.statistics.entity.Statistic;

import java.util.List;

public interface RankingStrategy {
    List<Ranking> calculateRankings(List<Statistic> statistics);
}

