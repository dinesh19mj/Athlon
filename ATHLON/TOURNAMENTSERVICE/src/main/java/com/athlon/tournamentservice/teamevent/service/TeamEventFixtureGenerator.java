package com.athlon.tournamentservice.teamevent.service;

import com.athlon.tournamentservice.match.entity.Match;
import com.athlon.tournamentservice.teamevent.entity.TeamEventCategory;
import com.athlon.tournamentservice.teamevent.entity.TeamEventCategoryMatch;
import com.athlon.tournamentservice.teamevent.repository.TeamEventCategoryMatchRepository;
import com.athlon.tournamentservice.teamevent.repository.TeamEventCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class TeamEventFixtureGenerator {

    private final TeamEventCategoryRepository categoryRepository;
    private final TeamEventCategoryMatchRepository categoryMatchRepository;

    public TeamEventFixtureGenerator(
            TeamEventCategoryRepository categoryRepository,
            TeamEventCategoryMatchRepository categoryMatchRepository) {
        this.categoryRepository = categoryRepository;
        this.categoryMatchRepository = categoryMatchRepository;
    }

    @Transactional
    public void generateCategoryMatchesForFixtures(Long tournamentId, List<Match> generatedFixtures) {
        // Fetch all categories for this tournament
        List<TeamEventCategory> categories = categoryRepository.findByTournamentIdAndIsActive(tournamentId, 1);
        
        if (categories.isEmpty()) {
            return; // Not a team event, or no categories configured
        }

        List<TeamEventCategoryMatch> categoryMatchesToSave = new ArrayList<>();

        for (Match fixture : generatedFixtures) {
            // For each fixture (Team A vs Team B), generate a match for each category
            for (TeamEventCategory category : categories) {
                TeamEventCategoryMatch categoryMatch = new TeamEventCategoryMatch();
                categoryMatch.setParentMatchId(fixture.getMatchId());
                categoryMatch.setTeamEventCategoryId(category.getId());
                categoryMatch.setMatchOrder(category.getDisplayOrder());
                categoryMatch.setTeamARegistrationId(fixture.getTeamARegistrationId());
                categoryMatch.setTeamBRegistrationId(fixture.getTeamBRegistrationId());
                categoryMatch.setStatus("SCHEDULED");
                
                categoryMatchesToSave.add(categoryMatch);
            }
        }

        categoryMatchRepository.saveAll(categoryMatchesToSave);
    }
}
