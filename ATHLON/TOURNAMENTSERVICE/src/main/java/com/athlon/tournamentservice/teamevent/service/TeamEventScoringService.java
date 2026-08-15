package com.athlon.tournamentservice.teamevent.service;

import com.athlon.tournamentservice.match.entity.Match;
import com.athlon.tournamentservice.match.repository.MatchRepository;
import com.athlon.tournamentservice.teamevent.entity.TeamEventCategoryMatch;
import com.athlon.tournamentservice.teamevent.entity.TeamEventConfig;
import com.athlon.tournamentservice.teamevent.repository.TeamEventCategoryMatchRepository;
import com.athlon.tournamentservice.teamevent.repository.TeamEventConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class TeamEventScoringService {

    private final MatchRepository matchRepository;
    private final TeamEventCategoryMatchRepository categoryMatchRepository;
    private final TeamEventConfigRepository configRepository;

    public TeamEventScoringService(
            MatchRepository matchRepository,
            TeamEventCategoryMatchRepository categoryMatchRepository,
            TeamEventConfigRepository configRepository) {
        this.matchRepository = matchRepository;
        this.categoryMatchRepository = categoryMatchRepository;
        this.configRepository = configRepository;
    }

    @Transactional
    public void submitCategoryMatchResult(Long categoryMatchId, Long winnerRegistrationId, String score) {
        TeamEventCategoryMatch categoryMatch = categoryMatchRepository.findById(categoryMatchId)
                .orElseThrow(() -> new IllegalArgumentException("Category match not found"));

        categoryMatch.setWinnerRegistrationId(winnerRegistrationId);
        categoryMatch.setScore(score);
        categoryMatch.setStatus("COMPLETED");
        categoryMatchRepository.save(categoryMatch);

        // Check if all category matches for the parent fixture are completed
        evaluateOverallFixtureResult(categoryMatch.getParentMatchId());
    }

    private void evaluateOverallFixtureResult(Long fixtureMatchId) {
        Match fixture = matchRepository.findById(fixtureMatchId)
                .orElseThrow(() -> new IllegalArgumentException("Fixture not found"));

        List<TeamEventCategoryMatch> categoryMatches = categoryMatchRepository.findByParentMatchId(fixtureMatchId);

        boolean allCompleted = true;
        int teamAWins = 0;
        int teamBWins = 0;

        for (TeamEventCategoryMatch cm : categoryMatches) {
            if (!"COMPLETED".equals(cm.getStatus())) {
                allCompleted = false;
            }
            if (cm.getWinnerRegistrationId() != null) {
                if (cm.getWinnerRegistrationId().equals(fixture.getTeamARegistrationId())) {
                    teamAWins++;
                } else if (cm.getWinnerRegistrationId().equals(fixture.getTeamBRegistrationId())) {
                    teamBWins++;
                }
            }
        }

        if (allCompleted) {
            fixture.setStatus("COMPLETED");
            if (teamAWins > teamBWins) {
                fixture.setWinnerRegistrationId(fixture.getTeamARegistrationId());
            } else if (teamBWins > teamAWins) {
                fixture.setWinnerRegistrationId(fixture.getTeamBRegistrationId());
            } else {
                // It's a draw, winner is null
                fixture.setWinnerRegistrationId(null);
            }
            matchRepository.save(fixture);
        }
    }
}
