package com.athlon.tournamentservice.drawengine.fixture;

import com.athlon.tournamentservice.drawengine.entity.Pool;
import com.athlon.tournamentservice.match.entity.Match;
import com.athlon.tournamentservice.registration.entity.Registration;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
public class LeagueFixtureGenerator {

    public List<Match> generateFixtures(Pool pool, List<Registration> poolTeams, Long categoryId, Long createdBy, Long tournamentId, UUID tournamentUuid) {
        if (poolTeams == null || poolTeams.size() < 2) {
            return Collections.emptyList();
        }

        List<Match> matches = new ArrayList<>();
        int n = poolTeams.size();

        // Round robin: every team plays every other team
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                Registration teamA = poolTeams.get(i);
                Registration teamB = poolTeams.get(j);

                Match match = new Match(
                        teamA.getRegistrationId(),
                        teamA.getRegistrationUuid(),
                        teamB.getRegistrationId(),
                        teamB.getRegistrationUuid(),
                        null,
                        null,
                        null,
                        createdBy
                );
                match.setMatchUuid(UUID.randomUUID());
                match.setTournamentId(tournamentId);
                match.setTournamentUuid(tournamentUuid);
                
                // Add pool information
                if (pool != null) {
                    match.setPoolId(pool.getPoolId());
                    match.setPoolName(pool.getPoolName());
                }

                matches.add(match);
            }
        }

        return matches;
    }
}
