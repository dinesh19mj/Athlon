package com.athlon.tournamentservice.sport.badminton;

import com.athlon.tournamentservice.sport.common.FixtureStrategy;
import com.athlon.tournamentservice.sport.common.RankingStrategy;
import com.athlon.tournamentservice.sport.common.ScoringStrategy;
import com.athlon.tournamentservice.sport.common.SportStrategy;
import com.athlon.tournamentservice.sport.common.StatisticsStrategy;
import org.springframework.stereotype.Component;

@Component
public class BadmintonSportStrategy implements SportStrategy {

    private final BadmintonScoringStrategy scoringStrategy;
    private final BadmintonFixtureStrategy fixtureStrategy;
    private final BadmintonRankingStrategy rankingStrategy;
    private final BadmintonStatisticsStrategy statisticsStrategy;

    public BadmintonSportStrategy(BadmintonScoringStrategy scoringStrategy,
                                  BadmintonFixtureStrategy fixtureStrategy,
                                  BadmintonRankingStrategy rankingStrategy,
                                  BadmintonStatisticsStrategy statisticsStrategy) {
        this.scoringStrategy = scoringStrategy;
        this.fixtureStrategy = fixtureStrategy;
        this.rankingStrategy = rankingStrategy;
        this.statisticsStrategy = statisticsStrategy;
    }

    @Override
    public String getSportType() {
        return "BADMINTON";
    }

    @Override
    public ScoringStrategy getScoringStrategy() {
        return scoringStrategy;
    }

    @Override
    public FixtureStrategy getFixtureStrategy() {
        return fixtureStrategy;
    }

    @Override
    public RankingStrategy getRankingStrategy() {
        return rankingStrategy;
    }

    @Override
    public StatisticsStrategy getStatisticsStrategy() {
        return statisticsStrategy;
    }
}

