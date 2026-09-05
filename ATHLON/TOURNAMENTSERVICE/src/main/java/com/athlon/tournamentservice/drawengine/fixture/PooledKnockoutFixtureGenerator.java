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
public class PooledKnockoutFixtureGenerator {

    /**
     * Generates an elimination knockout bracket inside a specific pool
     * that eliminates down to `qualifiersPerPool` winners.
     */
    public List<Match> generateFixtures(
            Pool pool,
            List<Registration> poolRegistrations,
            Long categoryId,
            Long createdBy,
            Long tournamentId,
            UUID tournamentUuid,
            int qualifiersPerPool
    ) {
        if (poolRegistrations == null || poolRegistrations.isEmpty()) {
            return Collections.emptyList();
        }

        List<Match> matches = new ArrayList<>();
        List<Registration> teams = new ArrayList<>(poolRegistrations);
        
        int n = teams.size();
        int rounds = (int) Math.ceil(Math.log(n) / Math.log(2));
        if (rounds == 0) rounds = 1;
        int drawSize = (int) Math.pow(2, rounds);
        
        // Ensure qualifiers is at least 1 and does not exceed drawSize / 2
        int qualifiers = Math.max(1, Math.min(qualifiersPerPool, drawSize / 2));
        
        // Heap indexes for matches that need to be played:
        // When qualifiers == 1: indexes 1 .. drawSize - 1 (root final at index 1)
        // When qualifiers == 2: indexes 2 .. drawSize - 1 (2 qualifier matches at indexes 2, 3)
        // When qualifiers == 4: indexes 4 .. drawSize - 1 (4 qualifier matches at indexes 4, 5, 6, 7)
        int minHeapIndex = qualifiers;
        int maxHeapIndex = drawSize - 1;
        
        if (minHeapIndex > maxHeapIndex) {
            return Collections.emptyList();
        }

        Match[] matchHeap = new Match[maxHeapIndex + 1];

        // 1. Create all matches in the active range [minHeapIndex .. maxHeapIndex]
        for (int i = minHeapIndex; i <= maxHeapIndex; i++) {
            Match m = new Match(null, null, null, null, null, null, null, createdBy);
            m.setMatchUuid(UUID.randomUUID());
            m.setTournamentId(tournamentId);
            m.setTournamentUuid(tournamentUuid);
            if (pool != null) {
                m.setPoolId(pool.getPoolId());
                m.setPoolName(pool.getPoolName());
            }
            matchHeap[i] = m;
            matches.add(m);
        }

        // 2. Link next matches within this pool bracket (child i advances to parent i / 2 only if parent >= minHeapIndex)
        for (int i = minHeapIndex; i <= maxHeapIndex; i++) {
            int parentIndex = i / 2;
            if (parentIndex >= minHeapIndex && matchHeap[parentIndex] != null) {
                matchHeap[i].setNextMatchUuid(matchHeap[parentIndex].getMatchUuid());
            }
        }

        // 3. Assign teams to leaf matches (leaves start at drawSize / 2)
        int firstLeafIndex = drawSize / 2;
        int regIndex = 0;

        for (int i = firstLeafIndex; i <= maxHeapIndex; i++) {
            Match leaf = matchHeap[i];
            if (leaf == null) continue;

            // Assign Team A
            if (regIndex < teams.size()) {
                Registration teamA = teams.get(regIndex++);
                leaf.setTeamARegistrationId(teamA.getRegistrationId());
                leaf.setTeamARegistrationUuid(teamA.getRegistrationUuid());
            }

            // Assign Team B
            if (regIndex < teams.size()) {
                Registration teamB = teams.get(regIndex++);
                leaf.setTeamBRegistrationId(teamB.getRegistrationId());
                leaf.setTeamBRegistrationUuid(teamB.getRegistrationUuid());
            }

            // Resolve Byes if single team
            if (leaf.getTeamARegistrationId() != null && leaf.getTeamBRegistrationId() == null) {
                leaf.setStatus("COMPLETED");
                leaf.setWinnerRegistrationId(leaf.getTeamARegistrationId());
                leaf.setWinnerRegistrationUuid(leaf.getTeamARegistrationUuid());

                // Advance Team A to next match if parent exists
                if (leaf.getNextMatchUuid() != null) {
                    int parentIndex = i / 2;
                    if (parentIndex >= minHeapIndex && matchHeap[parentIndex] != null) {
                        Match next = matchHeap[parentIndex];
                        if (i % 2 == 0) {
                            next.setTeamARegistrationId(leaf.getWinnerRegistrationId());
                            next.setTeamARegistrationUuid(leaf.getWinnerRegistrationUuid());
                        } else {
                            next.setTeamBRegistrationId(leaf.getWinnerRegistrationId());
                            next.setTeamBRegistrationUuid(leaf.getWinnerRegistrationUuid());
                        }
                    }
                }
            }
        }

        return matches;
    }

    // Overload for backward compatibility
    public List<Match> generateFixtures(
            Pool pool,
            List<Registration> poolRegistrations,
            Long categoryId,
            Long createdBy,
            Long tournamentId,
            UUID tournamentUuid
    ) {
        return generateFixtures(pool, poolRegistrations, categoryId, createdBy, tournamentId, tournamentUuid, 2);
    }
}

