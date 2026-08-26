package com.athlon.tournamentservice.teamchampionship.service;

import com.athlon.tournamentservice.teamchampionship.dto.response.StandingsRowDTO;
import com.athlon.tournamentservice.teamchampionship.dto.response.TeamSquadResponseDTO;
import com.athlon.tournamentservice.teamchampionship.entity.*;
import com.athlon.tournamentservice.teamchampionship.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeamChampionshipStandingsService {

    private final TeamChampionshipFixtureRepository fixtureRepository;
    private final TeamChampionshipPoolRepository poolRepository;
    private final ChampionshipTeamRegistrationRepository teamRegistrationRepository;
    private final ChampionshipSquadRepository squadRepository;
    private final ChampionshipRulesConfigRepository rulesConfigRepository;
    private final TeamChampionshipLineupEntryRepository lineupEntryRepository;
    private final TeamChampionshipLineupRepository lineupRepository;

    @Autowired
    public TeamChampionshipStandingsService(
            TeamChampionshipFixtureRepository fixtureRepository,
            TeamChampionshipPoolRepository poolRepository,
            ChampionshipTeamRegistrationRepository teamRegistrationRepository,
            ChampionshipSquadRepository squadRepository,
            ChampionshipRulesConfigRepository rulesConfigRepository,
            TeamChampionshipLineupEntryRepository lineupEntryRepository,
            TeamChampionshipLineupRepository lineupRepository) {
        this.fixtureRepository = fixtureRepository;
        this.poolRepository = poolRepository;
        this.teamRegistrationRepository = teamRegistrationRepository;
        this.squadRepository = squadRepository;
        this.rulesConfigRepository = rulesConfigRepository;
        this.lineupEntryRepository = lineupEntryRepository;
        this.lineupRepository = lineupRepository;
    }

    public List<StandingsRowDTO> getStandingsForChampionship(UUID championshipUuid) {
        List<TeamChampionshipPool> pools = poolRepository.findByChampionshipUuid(championshipUuid);
        List<TeamChampionshipFixture> fixtures = fixtureRepository.findByChampionshipUuid(championshipUuid);
        List<ChampionshipTeamRegistration> teams = teamRegistrationRepository.findByChampionshipUuid(championshipUuid);

        Map<Long, StandingsRowDTO> map = new HashMap<>();
        for (ChampionshipTeamRegistration t : teams) {
            StandingsRowDTO row = new StandingsRowDTO();
            row.setTeamId(t.getTeamId());
            row.setTeamName(t.getTeamName());
            row.setLogoUrl(t.getLogoUrl());
            map.put(t.getTeamId(), row);
        }

        // Process completed fixtures
        for (TeamChampionshipFixture f : fixtures) {
            if (f.getPoolId() != null && map.containsKey(f.getTeamAId())) {
                map.get(f.getTeamAId()).setPoolId(f.getPoolId());
            }
            if (f.getPoolId() != null && map.containsKey(f.getTeamBId())) {
                map.get(f.getTeamBId()).setPoolId(f.getPoolId());
            }

            if ("COMPLETED".equalsIgnoreCase(f.getStatus())) {
                StandingsRowDTO rowA = map.get(f.getTeamAId());
                StandingsRowDTO rowB = map.get(f.getTeamBId());

                if (rowA != null && rowB != null) {
                    rowA.setPlayed(rowA.getPlayed() + 1);
                    rowB.setPlayed(rowB.getPlayed() + 1);

                    rowA.setSubMatchesWon(rowA.getSubMatchesWon() + f.getTeamAPoints());
                    rowA.setSubMatchesLost(rowA.getSubMatchesLost() + f.getTeamBPoints());
                    rowA.setSubMatchDiff(rowA.getSubMatchesWon() - rowA.getSubMatchesLost());

                    rowB.setSubMatchesWon(rowB.getSubMatchesWon() + f.getTeamBPoints());
                    rowB.setSubMatchesLost(rowB.getSubMatchesLost() + f.getTeamAPoints());
                    rowB.setSubMatchDiff(rowB.getSubMatchesWon() - rowB.getSubMatchesLost());

                    if (f.getTeamAPoints() > f.getTeamBPoints()) {
                        rowA.setWon(rowA.getWon() + 1);
                        rowA.setPoints(rowA.getPoints() + 2);
                        rowB.setLost(rowB.getLost() + 1);
                    } else if (f.getTeamBPoints() > f.getTeamAPoints()) {
                        rowB.setWon(rowB.getWon() + 1);
                        rowB.setPoints(rowB.getPoints() + 2);
                        rowA.setLost(rowA.getLost() + 1);
                    } else {
                        rowA.setTies(rowA.getTies() + 1);
                        rowA.setPoints(rowA.getPoints() + 1);
                        rowB.setTies(rowB.getTies() + 1);
                        rowB.setPoints(rowB.getPoints() + 1);
                    }
                }
            }
        }

        // Assign pool names and rank
        Map<Long, String> poolNameMap = pools.stream().collect(Collectors.toMap(TeamChampionshipPool::getPoolId, TeamChampionshipPool::getPoolName));
        for (StandingsRowDTO row : map.values()) {
            if (row.getPoolId() != null) {
                row.setPoolName(poolNameMap.getOrDefault(row.getPoolId(), "Pool"));
            }
        }

        List<StandingsRowDTO> list = new ArrayList<>(map.values());
        list.sort((a, b) -> {
            int pComp = Integer.compare(b.getPoints(), a.getPoints());
            if (pComp != 0) return pComp;
            int diffComp = Integer.compare(b.getSubMatchDiff(), a.getSubMatchDiff());
            if (diffComp != 0) return diffComp;
            return Integer.compare(b.getSubMatchesWon(), a.getSubMatchesWon());
        });

        for (int i = 0; i < list.size(); i++) {
            list.get(i).setRank(i + 1);
            list.get(i).setIsQualified(i < 2); // Top 2 qualify by default
        }

        return list;
    }

    public TeamSquadResponseDTO getTeamParticipationAudit(Long teamId, Long championshipId) {
        ChampionshipTeamRegistration team = teamRegistrationRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        List<ChampionshipSquad> squad = squadRepository.findByTeamId(teamId);
        Optional<ChampionshipRulesConfig> rulesOpt = rulesConfigRepository.findByChampionshipId(championshipId);
        boolean ruleRequired = rulesOpt.map(ChampionshipRulesConfig::getEveryPlayerMustPlayLeague).orElse(false);

        // Find all player IDs that have appeared in approved lineups for this team
        List<TeamChampionshipLineup> lineups = lineupRepository.findAll().stream()
                .filter(l -> l.getTeamId().equals(teamId) && "APPROVED".equalsIgnoreCase(l.getStatus()))
                .collect(Collectors.toList());

        Set<Long> playedPlayerIds = new HashSet<>();
        for (TeamChampionshipLineup l : lineups) {
            List<TeamChampionshipLineupEntry> entries = lineupEntryRepository.findByLineupId(l.getLineupId());
            for (TeamChampionshipLineupEntry e : entries) {
                playedPlayerIds.add(e.getPlayerId());
            }
        }

        List<String> unplayed = new ArrayList<>();
        for (ChampionshipSquad sp : squad) {
            sp.setMatchesPlayedCount(playedPlayerIds.contains(sp.getPlayerId()) ? 1 : 0);
            if (!playedPlayerIds.contains(sp.getPlayerId())) {
                unplayed.add(sp.getPlayerName());
            }
        }

        TeamSquadResponseDTO dto = new TeamSquadResponseDTO();
        dto.setTeamId(team.getTeamId());
        dto.setTeamUuid(team.getTeamUuid().toString());
        dto.setTeamName(team.getTeamName());
        dto.setLogoUrl(team.getLogoUrl());
        dto.setCaptainName(team.getCaptainName());
        dto.setSquadCapacity(rulesOpt.map(ChampionshipRulesConfig::getMaxSquadSize).orElse(12));
        dto.setPlayersCount(squad.size());
        dto.setPlayers(squad);
        dto.setEveryPlayerHasPlayedLeague(unplayed.isEmpty());
        dto.setUnplayedPlayers(unplayed);

        return dto;
    }
}
