package com.athlon.tournament.sport.common;

public interface SportStrategy {
    String getSportType();
    ScoringStrategy getScoringStrategy();
    FixtureStrategy getFixtureStrategy();
    RankingStrategy getRankingStrategy();
    StatisticsStrategy getStatisticsStrategy();
}
