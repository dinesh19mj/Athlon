package com.athlon.tournamentservice.drawengine.fixture;

import com.athlon.tournamentservice.match.entity.Match;
import com.athlon.tournamentservice.registration.entity.Registration;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
public class KnockoutFixtureGenerator implements FixtureGenerator {

    @Override
    public List<Match> generateFixtures(List<Registration> registrations, Long categoryId, Long createdBy, Long tournamentId, UUID tournamentUuid) {
        if (registrations == null || registrations.isEmpty()) {
            return Collections.emptyList();
        }

        List<Match> matches = new ArrayList<>();
        List<Registration> shuffledRegs = new ArrayList<>(registrations);
        Collections.shuffle(shuffledRegs);
        
        int n = shuffledRegs.size();
        int rounds = (int) Math.ceil(Math.log(n) / Math.log(2));
        if (rounds == 0) rounds = 1; // At least one round for 1 team (walkover)
        int drawSize = (int) Math.pow(2, rounds);
        
        int totalMatches = drawSize - 1;
        Match[] matchHeap = new Match[totalMatches + 1]; // 1-indexed
        
        // 1. Create all matches and generate UUIDs
        for (int i = 1; i <= totalMatches; i++) {
            Match m = new Match(null, null, null, null, null, null, null, createdBy);
            m.setMatchUuid(UUID.randomUUID());
            m.setTournamentId(tournamentId);
            m.setTournamentUuid(tournamentUuid);
            matchHeap[i] = m;
            matches.add(m);
        }
        
        // 2. Link next matches (i advances to i/2)
        for (int i = 2; i <= totalMatches; i++) {
            Match nextMatch = matchHeap[i / 2];
            matchHeap[i].setNextMatchUuid(nextMatch.getMatchUuid());
        }
        
        // 3. Assign teams to leaf matches (the second half of the heap array)
        int firstLeafIndex = drawSize / 2;
        int regIndex = 0;
        
        // We have drawSize/2 leaf matches. Each can hold 2 teams.
        for (int i = firstLeafIndex; i <= totalMatches; i++) {
            Match leaf = matchHeap[i];
            
            // Assign Team A
            if (regIndex < shuffledRegs.size()) {
                Registration teamA = shuffledRegs.get(regIndex++);
                leaf.setTeamARegistrationId(teamA.getRegistrationId());
                leaf.setTeamARegistrationUuid(teamA.getRegistrationUuid());
            }
            
            // Assign Team B
            if (regIndex < shuffledRegs.size()) {
                Registration teamB = shuffledRegs.get(regIndex++);
                leaf.setTeamBRegistrationId(teamB.getRegistrationId());
                leaf.setTeamBRegistrationUuid(teamB.getRegistrationUuid());
            }
            
            // Resolve Byes if a team is missing
            if (leaf.getTeamARegistrationId() != null && leaf.getTeamBRegistrationId() == null) {
                // Team A gets a bye
                leaf.setStatus("COMPLETED");
                leaf.setWinnerRegistrationId(leaf.getTeamARegistrationId());
                leaf.setWinnerRegistrationUuid(leaf.getTeamARegistrationUuid());
                
                // Advance Team A to next match immediately
                if (leaf.getNextMatchUuid() != null) {
                    Match next = matchHeap[i / 2];
                    if (i % 2 == 0) { // Left child
                        next.setTeamARegistrationId(leaf.getWinnerRegistrationId());
                        next.setTeamARegistrationUuid(leaf.getWinnerRegistrationUuid());
                    } else { // Right child
                        next.setTeamBRegistrationId(leaf.getWinnerRegistrationId());
                        next.setTeamBRegistrationUuid(leaf.getWinnerRegistrationUuid());
                    }
                }
            }
        }
        
        return matches;
    }
}
