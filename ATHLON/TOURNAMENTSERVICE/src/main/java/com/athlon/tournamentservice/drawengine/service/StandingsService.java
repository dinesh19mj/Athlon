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
        for (Map.Entry<Long, Map<UUID, PoolStandingDTO>> entry : standingsMap.entrySet()) {
            List<PoolStandingDTO> poolStandings = new ArrayList<>(entry.getValue().values());
            
            // Sort by points descending, then won descending, then played ascending
            poolStandings.sort(Comparator
                    .comparingInt(PoolStandingDTO::getPoints).reversed()
                    .thenComparingInt(PoolStandingDTO::getWon).reversed()
                    .thenComparingInt(PoolStandingDTO::getPlayed));
            
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
