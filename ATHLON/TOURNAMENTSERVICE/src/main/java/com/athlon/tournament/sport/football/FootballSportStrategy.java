package com.athlon.tournament.sport.football;

import com.athlon.tournament.sport.common.FixtureStrategy;
import com.athlon.tournament.sport.common.RankingStrategy;
import com.athlon.tournament.sport.common.ScoringStrategy;
import com.athlon.tournament.sport.common.SportStrategy;
import com.athlon.tournament.sport.common.StatisticsStrategy;
import org.springframework.stereotype.Component;

@Component
public class FootballSportStrategy implements SportStrategy {

    private final FootballScoringStrategy scoringStrategy;
    private final FootballFixtureStrategy fixtureStrategy;
    private final FootballRankingStrategy rankingStrategy;
    private final FootballStatisticsStrategy statisticsStrategy;

    public FootballSportStrategy(FootballScoringStrategy scoringStrategy,
                                 FootballFixtureStrategy fixtureStrategy,
                                 FootballRankingStrategy rankingStrategy,
                                 FootballStatisticsStrategy statisticsStrategy) {
        this.scoringStrategy = scoringStrategy;
        this.fixtureStrategy = fixtureStrategy;
        this.rankingStrategy = rankingStrategy;
        this.statisticsStrategy = statisticsStrategy;
    }

    @Override
    public String getSportType() {
        return "FOOTBALL";
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
