package com.athlon.tournamentservice.sport.volleyball;

import com.athlon.tournamentservice.sport.common.FixtureStrategy;
import com.athlon.tournamentservice.sport.common.RankingStrategy;
import com.athlon.tournamentservice.sport.common.ScoringStrategy;
import com.athlon.tournamentservice.sport.common.SportStrategy;
import com.athlon.tournamentservice.sport.common.StatisticsStrategy;
import org.springframework.stereotype.Component;

@Component
public class VolleyballSportStrategy implements SportStrategy {

    private final VolleyballScoringStrategy scoringStrategy;
    private final VolleyballFixtureStrategy fixtureStrategy;
    private final VolleyballRankingStrategy rankingStrategy;
    private final VolleyballStatisticsStrategy statisticsStrategy;

    public VolleyballSportStrategy(VolleyballScoringStrategy scoringStrategy,
                                   VolleyballFixtureStrategy fixtureStrategy,
                                   VolleyballRankingStrategy rankingStrategy,
                                   VolleyballStatisticsStrategy statisticsStrategy) {
        this.scoringStrategy = scoringStrategy;
        this.fixtureStrategy = fixtureStrategy;
        this.rankingStrategy = rankingStrategy;
        this.statisticsStrategy = statisticsStrategy;
    }

    @Override
    public String getSportType() {
        return "VOLLEYBALL";
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

