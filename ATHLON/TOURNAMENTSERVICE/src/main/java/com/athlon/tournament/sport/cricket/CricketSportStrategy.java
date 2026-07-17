package com.athlon.tournament.sport.cricket;

import com.athlon.tournament.sport.common.FixtureStrategy;
import com.athlon.tournament.sport.common.RankingStrategy;
import com.athlon.tournament.sport.common.ScoringStrategy;
import com.athlon.tournament.sport.common.SportStrategy;
import com.athlon.tournament.sport.common.StatisticsStrategy;
import org.springframework.stereotype.Component;

@Component
public class CricketSportStrategy implements SportStrategy {

    private final CricketScoringStrategy scoringStrategy;
    private final CricketFixtureStrategy fixtureStrategy;
    private final CricketRankingStrategy rankingStrategy;
    private final CricketStatisticsStrategy statisticsStrategy;

    public CricketSportStrategy(CricketScoringStrategy scoringStrategy,
                                CricketFixtureStrategy fixtureStrategy,
                                CricketRankingStrategy rankingStrategy,
                                CricketStatisticsStrategy statisticsStrategy) {
        this.scoringStrategy = scoringStrategy;
        this.fixtureStrategy = fixtureStrategy;
        this.rankingStrategy = rankingStrategy;
        this.statisticsStrategy = statisticsStrategy;
    }

    @Override
    public String getSportType() {
        return "CRICKET";
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
