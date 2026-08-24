package com.athlon.tournamentservice.drawengine.service;

import com.athlon.tournamentservice.drawengine.entity.Pool;
import com.athlon.tournamentservice.drawengine.repository.PoolRepository;
import com.athlon.tournamentservice.dto.response.PoolStandingDTO;
import com.athlon.tournamentservice.match.entity.Match;
import com.athlon.tournamentservice.match.repository.MatchRepository;
import com.athlon.tournamentservice.registration.entity.Registration;
import com.athlon.tournamentservice.registration.repository.RegistrationRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StandingsService {

    private final MatchRepository matchRepository;
    private final PoolRepository poolRepository;
    private final RegistrationRepository registrationRepository;

    public StandingsService(MatchRepository matchRepository, PoolRepository poolRepository, RegistrationRepository registrationRepository) {
        this.matchRepository = matchRepository;
        this.poolRepository = poolRepository;
        this.registrationRepository = registrationRepository;
    }

    public List<PoolStandingDTO> getStandingsForTournament(UUID tournamentUuid) {
        List<Match> matches = matchRepository.findByTournamentUuid(tournamentUuid);
        // Only league matches have poolId
        List<Match> leagueMatches = matches.stream()
                .filter(m -> m.getPoolId() != null)
                .collect(Collectors.toList());

        Map<Long, Map<UUID, PoolStandingDTO>> standingsMap = new HashMap<>();
        
        // Find all unique teams and pools from matches to initialize standings
        for (Match m : leagueMatches) {
            standingsMap.putIfAbsent(m.getPoolId(), new HashMap<>());
            Map<UUID, PoolStandingDTO> poolMap = standingsMap.get(m.getPoolId());

            if (m.getTeamARegistrationUuid() != null) {
                poolMap.putIfAbsent(m.getTeamARegistrationUuid(), initializeStanding(m.getPoolId(), m.getPoolName(), m.getTeamARegistrationUuid()));
            }
            if (m.getTeamBRegistrationUuid() != null) {
                poolMap.putIfAbsent(m.getTeamBRegistrationUuid(), initializeStanding(m.getPoolId(), m.getPoolName(), m.getTeamBRegistrationUuid()));
            }
        }

        // Process completed matches
        for (Match m : leagueMatches) {
            if ("COMPLETED".equalsIgnoreCase(m.getStatus())) {
                UUID teamA = m.getTeamARegistrationUuid();
                UUID teamB = m.getTeamBRegistrationUuid();
                UUID winner = m.getWinnerRegistrationUuid();

                if (teamA != null && teamB != null && winner != null) {
                    PoolStandingDTO aStanding = standingsMap.get(m.getPoolId()).get(teamA);
                    PoolStandingDTO bStanding = standingsMap.get(m.getPoolId()).get(teamB);

                    aStanding.setPlayed(aStanding.getPlayed() + 1);
                    bStanding.setPlayed(bStanding.getPlayed() + 1);

                    if (winner.equals(teamA)) {
                        aStanding.setWon(aStanding.getWon() + 1);
                        aStanding.setPoints(aStanding.getPoints() + 3);
                        bStanding.setLost(bStanding.getLost() + 1);
                    } else if (winner.equals(teamB)) {
                        bStanding.setWon(bStanding.getWon() + 1);
                        bStanding.setPoints(bStanding.getPoints() + 3);
                        aStanding.setLost(aStanding.getLost() + 1);
                    }
                }
            }
        }

        // Flatten and rank
        List<PoolStandingDTO> result = new ArrayList<>();
        // Sort pool entries by poolId/poolName
        List<Map.Entry<Long, Map<UUID, PoolStandingDTO>>> sortedEntries = new ArrayList<>(standingsMap.entrySet());
        sortedEntries.sort(Comparator.comparing(e -> {
            var map = e.getValue();
            if (!map.isEmpty()) {
                String pName = map.values().iterator().next().getPoolName();
                if (pName != null) return pName;
            }
            return String.valueOf(e.getKey());
        }));

        for (Map.Entry<Long, Map<UUID, PoolStandingDTO>> entry : sortedEntries) {
            List<PoolStandingDTO> poolStandings = new ArrayList<>(entry.getValue().values());
            
            // Sort teams in this pool:
            // 1. Points (Descending)
            // 2. Won (Descending)
            // 3. Lost (Ascending)
            // 4. Played (Descending)
            poolStandings.sort((a, b) -> {
                int ptsDiff = Integer.compare(b.getPoints(), a.getPoints());
                if (ptsDiff != 0) return ptsDiff;

                int wonDiff = Integer.compare(b.getWon(), a.getWon());
                if (wonDiff != 0) return wonDiff;

                int lostDiff = Integer.compare(a.getLost(), b.getLost());
                if (lostDiff != 0) return lostDiff;

                return Integer.compare(b.getPlayed(), a.getPlayed());
            });
            
            for (int i = 0; i < poolStandings.size(); i++) {
                poolStandings.get(i).setRank(i + 1);
            }
            
            result.addAll(poolStandings);
        }

        return result;
    }

    private PoolStandingDTO initializeStanding(Long poolId, String poolName, UUID teamUuid) {
        PoolStandingDTO dto = new PoolStandingDTO();
        dto.setPoolId(poolId);
        dto.setPoolName(poolName);
        dto.setTeamUuid(teamUuid);
        
        Optional<Registration> reg = registrationRepository.findByRegistrationUuid(teamUuid);
        dto.setTeamName(reg.map(Registration::getTeamName).orElse("Unknown Team"));
        
        dto.setPlayed(0);
        dto.setWon(0);
        dto.setLost(0);
        dto.setPoints(0);
        dto.setRank(0);
        return dto;
    }
}
