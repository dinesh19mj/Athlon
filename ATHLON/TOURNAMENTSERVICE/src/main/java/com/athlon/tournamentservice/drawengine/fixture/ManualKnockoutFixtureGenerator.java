package com.athlon.tournamentservice.drawengine.fixture;

import com.athlon.tournamentservice.dto.request.ManualDrawRequest;
import com.athlon.tournamentservice.match.entity.Match;
import com.athlon.tournamentservice.registration.entity.Registration;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class ManualKnockoutFixtureGenerator {

    public List<Match> generateFixtures(List<Registration> registrations, ManualDrawRequest request, Long categoryId, Long createdBy, Long tournamentId, UUID tournamentUuid) {
        if (registrations == null || registrations.isEmpty() || request.getPairings() == null) {
            return Collections.emptyList();
        }

        Map<UUID, Registration> regMap = registrations.stream()
                .collect(Collectors.toMap(Registration::getRegistrationUuid, Function.identity()));

        List<Match> matches = new ArrayList<>();
        
        int numPairings = request.getPairings().size(); // e.g. 4 pairings means 8 slots
        int drawSize = numPairings * 2;
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

        // 3. Assign teams to leaf matches based on pairings
        // The leaf matches start at index drawSize / 2
        int firstLeafIndex = drawSize / 2;

        for (ManualDrawRequest.ManualPairing pairing : request.getPairings()) {
            // slotIndex should ideally be 1 to numPairings. So match index = firstLeafIndex + slotIndex - 1
            int matchIndex = firstLeafIndex + pairing.getSlotIndex() - 1;
            if (matchIndex < firstLeafIndex || matchIndex > totalMatches) {
                continue; // invalid slot index
            }

            Match leaf = matchHeap[matchIndex];

            // Assign Team A
            if (pairing.getTeamAUuid() != null) {
                Registration teamA = regMap.get(pairing.getTeamAUuid());
                if (teamA != null) {
                    leaf.setTeamARegistrationId(teamA.getRegistrationId());
                    leaf.setTeamARegistrationUuid(teamA.getRegistrationUuid());
                }
            }

            // Assign Team B
            if (pairing.getTeamBUuid() != null) {
                Registration teamB = regMap.get(pairing.getTeamBUuid());
                if (teamB != null) {
                    leaf.setTeamBRegistrationId(teamB.getRegistrationId());
                    leaf.setTeamBRegistrationUuid(teamB.getRegistrationUuid());
                }
            }

            // Resolve Byes if a team is missing
            if (leaf.getTeamARegistrationId() != null && leaf.getTeamBRegistrationId() == null) {
                leaf.setStatus("COMPLETED");
                leaf.setWinnerRegistrationId(leaf.getTeamARegistrationId());
                leaf.setWinnerRegistrationUuid(leaf.getTeamARegistrationUuid());
                advanceWinner(leaf, matchHeap, matchIndex);
            } else if (leaf.getTeamBRegistrationId() != null && leaf.getTeamARegistrationId() == null) {
                leaf.setStatus("COMPLETED");
                leaf.setWinnerRegistrationId(leaf.getTeamBRegistrationId());
                leaf.setWinnerRegistrationUuid(leaf.getTeamBRegistrationUuid());
                advanceWinner(leaf, matchHeap, matchIndex);
            }
        }

        return matches;
    }

    private void advanceWinner(Match leaf, Match[] matchHeap, int matchIndex) {
        if (leaf.getNextMatchUuid() != null) {
            Match next = matchHeap[matchIndex / 2];
            if (matchIndex % 2 == 0) { // Left child
                next.setTeamARegistrationId(leaf.getWinnerRegistrationId());
                next.setTeamARegistrationUuid(leaf.getWinnerRegistrationUuid());
            } else { // Right child
                next.setTeamBRegistrationId(leaf.getWinnerRegistrationId());
                next.setTeamBRegistrationUuid(leaf.getWinnerRegistrationUuid());
            }
        }
    }
}
