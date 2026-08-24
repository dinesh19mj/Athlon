package com.athlon.tournamentservice.drawengine;

import com.athlon.tournamentservice.drawengine.entity.Draw;
import com.athlon.tournamentservice.drawengine.fixture.KnockoutFixtureGenerator;
import com.athlon.tournamentservice.drawengine.repository.DrawRepository;
import com.athlon.tournamentservice.drawengine.validation.DrawValidationEngine;
import com.athlon.tournamentservice.match.entity.Match;
import com.athlon.tournamentservice.match.repository.MatchRepository;
import com.athlon.tournamentservice.registration.entity.Registration;
import com.athlon.tournamentservice.registration.repository.RegistrationRepository;
import com.athlon.tournamentservice.tournament.entity.Tournament;
import com.athlon.tournamentservice.tournament.repository.TournamentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.athlon.tournamentservice.dto.request.LeagueDrawRequest;
import com.athlon.tournamentservice.drawengine.entity.Pool;
import com.athlon.tournamentservice.drawengine.entity.PoolTeam;
import com.athlon.tournamentservice.drawengine.repository.PoolRepository;
import com.athlon.tournamentservice.drawengine.repository.PoolTeamRepository;
import com.athlon.tournamentservice.drawengine.fixture.LeagueFixtureGenerator;
import com.athlon.tournamentservice.drawengine.service.StandingsService;
import com.athlon.tournamentservice.dto.response.PoolStandingDTO;
import com.athlon.tournamentservice.dto.request.ManualDrawRequest;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DrawEngineService {

    private final TournamentRepository tournamentRepository;
    private final RegistrationRepository registrationRepository;
    private final DrawValidationEngine validationEngine;
    private final KnockoutFixtureGenerator knockoutFixtureGenerator;
    private final com.athlon.tournamentservice.drawengine.fixture.ManualKnockoutFixtureGenerator manualKnockoutFixtureGenerator;
    private final DrawRepository drawRepository;
    private final MatchRepository matchRepository;
    private final PoolRepository poolRepository;
    private final PoolTeamRepository poolTeamRepository;
    private final LeagueFixtureGenerator leagueFixtureGenerator;
    private final StandingsService standingsService;
    private final com.athlon.tournamentservice.teamevent.service.TeamEventFixtureGenerator teamEventFixtureGenerator;

    @Autowired
    public DrawEngineService(
            TournamentRepository tournamentRepository,
            RegistrationRepository registrationRepository,
            DrawValidationEngine validationEngine,
            KnockoutFixtureGenerator knockoutFixtureGenerator,
            com.athlon.tournamentservice.drawengine.fixture.ManualKnockoutFixtureGenerator manualKnockoutFixtureGenerator,
            DrawRepository drawRepository,
            MatchRepository matchRepository,
            PoolRepository poolRepository,
            PoolTeamRepository poolTeamRepository,
            LeagueFixtureGenerator leagueFixtureGenerator,
            StandingsService standingsService,
            com.athlon.tournamentservice.teamevent.service.TeamEventFixtureGenerator teamEventFixtureGenerator) {
        this.tournamentRepository = tournamentRepository;
        this.registrationRepository = registrationRepository;
        this.validationEngine = validationEngine;
        this.knockoutFixtureGenerator = knockoutFixtureGenerator;
        this.manualKnockoutFixtureGenerator = manualKnockoutFixtureGenerator;
        this.drawRepository = drawRepository;
        this.matchRepository = matchRepository;
        this.poolRepository = poolRepository;
        this.poolTeamRepository = poolTeamRepository;
        this.leagueFixtureGenerator = leagueFixtureGenerator;
        this.standingsService = standingsService;
        this.teamEventFixtureGenerator = teamEventFixtureGenerator;
    }

    @Transactional
    public Draw orchestrateDraw(UUID tournamentUuid, String type, Long createdBy) {
        // 1. Fetch tournament
        Tournament tournament = tournamentRepository.findByTournamentUuid(tournamentUuid)
                .orElseThrow(() -> new IllegalArgumentException("Tournament not found"));

        // 2. Fetch approved registrations
        List<Registration> registrations = registrationRepository.findByTournamentIdAndStatus(tournament.getTournamentId(), "APPROVED");

        // 3. Prevent duplicate draws (Optional: or delete old ones)
        Long categoryId = 1L; // Placeholder since tournament doesn't have a direct categoryId mapping in this version
        List<Draw> existingDraws = drawRepository.findByTournamentId(tournament.getTournamentId());
        if (!existingDraws.isEmpty()) {
            throw new IllegalStateException("Draw has already been generated. Please delete it first.");
        }

        // 4. Validate
        validationEngine.validateForDrawGeneration(registrations, categoryId);

        // 5. Generate Fixtures based on Type
        List<Match> generatedMatches;
        int drawSize = registrations.size();
        if ("KNOCKOUT".equalsIgnoreCase(type)) {
            generatedMatches = knockoutFixtureGenerator.generateFixtures(registrations, categoryId, createdBy, tournament.getTournamentId(), tournament.getTournamentUuid());
            if (registrations.size() > 0) {
                int rounds = (int) Math.ceil(Math.log(registrations.size()) / Math.log(2));
                drawSize = (int) Math.pow(2, rounds);
            }
        } else {
            throw new UnsupportedOperationException("Draw type " + type + " is not supported yet.");
        }

        if ("TEAM_EVENT".equalsIgnoreCase(tournament.getTournamentType())) {
            for (Match m : generatedMatches) {
                m.setStatus("WAITING_FOR_LINEUPS");
            }
        }

        // 6. Persist matches
        generatedMatches = matchRepository.saveAll(generatedMatches);

        if ("TEAM_EVENT".equalsIgnoreCase(tournament.getTournamentType())) {
            teamEventFixtureGenerator.generateCategoryMatchesForFixtures(tournament.getTournamentId(), generatedMatches);
        }

        // 7. Persist Draw metadata
        Draw draw = new Draw(tournament.getTournamentId(), categoryId, type.toUpperCase(), drawSize, createdBy);
        draw.setStatus("PUBLISHED");
        drawRepository.save(draw);

        return draw;
    }

    @Transactional
    public Draw orchestrateManualDraw(UUID tournamentUuid, com.athlon.tournamentservice.dto.request.ManualDrawRequest request, Long createdBy) {
        Tournament tournament = tournamentRepository.findByTournamentUuid(tournamentUuid)
                .orElseThrow(() -> new IllegalArgumentException("Tournament not found"));

        List<Registration> registrations = registrationRepository.findByTournamentIdAndStatus(tournament.getTournamentId(), "APPROVED");

        Long categoryId = 1L; // Placeholder
        List<Draw> existingDraws = drawRepository.findByTournamentId(tournament.getTournamentId());
        if (!existingDraws.isEmpty()) {
            throw new IllegalStateException("Draw has already been generated. Please delete it first.");
        }

        validationEngine.validateForDrawGeneration(registrations, categoryId);

        List<Match> generatedMatches;
        int numPairings = request.getPairings().size();
        int drawSize = numPairings * 2;
        String type = request.getDrawType() != null ? request.getDrawType() : "KNOCKOUT";

        if ("KNOCKOUT".equalsIgnoreCase(type)) {
            generatedMatches = manualKnockoutFixtureGenerator.generateFixtures(registrations, request, categoryId, createdBy, tournament.getTournamentId(), tournament.getTournamentUuid());
        } else {
            throw new UnsupportedOperationException("Manual draw type " + type + " is not supported yet.");
        }

        if ("TEAM_EVENT".equalsIgnoreCase(tournament.getTournamentType())) {
            for (Match m : generatedMatches) {
                m.setStatus("WAITING_FOR_LINEUPS");
            }
        }

        generatedMatches = matchRepository.saveAll(generatedMatches);

        if ("TEAM_EVENT".equalsIgnoreCase(tournament.getTournamentType())) {
            teamEventFixtureGenerator.generateCategoryMatchesForFixtures(tournament.getTournamentId(), generatedMatches);
        }

        Draw draw = new Draw(tournament.getTournamentId(), categoryId, type.toUpperCase(), drawSize, createdBy);
        draw.setStatus("PUBLISHED");
        drawRepository.save(draw);

        return draw;
    }

    @Transactional
    public void deleteDraw(UUID tournamentUuid) {
        Tournament tournament = tournamentRepository.findByTournamentUuid(tournamentUuid)
                .orElseThrow(() -> new IllegalArgumentException("Tournament not found"));
        
        Long categoryId = 1L; // Placeholder consistent with creation
        
        // Delete all matches for this tournament
        matchRepository.deleteByTournamentUuid(tournamentUuid);
        
        // Delete the draw record
        drawRepository.deleteByTournamentId(tournament.getTournamentId());
        
        // Also delete pools and pool teams if exist
        List<Draw> draws = drawRepository.findByTournamentId(tournament.getTournamentId());
        for (Draw d : draws) {
            List<Pool> pools = poolRepository.findByDrawId(d.getDrawId());
            for (Pool p : pools) {
                poolTeamRepository.deleteByPoolId(p.getPoolId());
            }
            poolRepository.deleteByDrawId(d.getDrawId());
        }
    }

    @Transactional
    public Draw orchestrateLeagueDraw(UUID tournamentUuid, LeagueDrawRequest request, Long createdBy) {
        Tournament tournament = tournamentRepository.findByTournamentUuid(tournamentUuid)
                .orElseThrow(() -> new IllegalArgumentException("Tournament not found"));

        List<Registration> allRegistrations = registrationRepository.findByTournamentIdAndStatus(tournament.getTournamentId(), "APPROVED");

        Long categoryId = 1L; // Placeholder
        List<Draw> existingDraws = drawRepository.findByTournamentId(tournament.getTournamentId());
        if (!existingDraws.isEmpty()) {
            throw new IllegalStateException("Draw has already been generated. Please delete it first.");
        }

        validationEngine.validateForDrawGeneration(allRegistrations, categoryId);

        // Calculate draw size and total matches
        int totalTeams = allRegistrations.size();
        
        // 1. Create Draw record
        Draw draw = new Draw(tournament.getTournamentId(), categoryId, "LEAGUE", totalTeams, createdBy);
        draw.setStatus("PUBLISHED");
        drawRepository.save(draw);

        List<Match> allLeagueMatches = new ArrayList<>();

        // 2. Process each pool
        for (LeagueDrawRequest.PoolAssignmentDTO poolDto : request.getPools()) {
            Pool pool = new Pool(draw.getDrawId(), poolDto.getPoolName(), poolDto.getCapacity(), createdBy);
            // Assuming we added qualifiers? Pool doesn't have qualifiers right now, but that's fine we can just not save it to db or update Pool entity. 
            // For now, let's just save the pool.
            pool = poolRepository.save(pool);

            List<Registration> poolTeams = new ArrayList<>();
            
            for (UUID teamUuid : poolDto.getTeamUuids()) {
                Registration reg = allRegistrations.stream()
                        .filter(r -> r.getRegistrationUuid().equals(teamUuid))
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("Team not found in approved registrations: " + teamUuid));
                
                poolTeams.add(reg);
                
                PoolTeam pt = new PoolTeam(pool.getPoolId(), reg.getRegistrationId());
                poolTeamRepository.save(pt);
            }

            // 3. Generate matches for this pool
            List<Match> poolMatches = leagueFixtureGenerator.generateFixtures(
                    pool, poolTeams, categoryId, createdBy, tournament.getTournamentId(), tournament.getTournamentUuid());
            
            allLeagueMatches.addAll(poolMatches);
        }

        if ("TEAM_EVENT".equalsIgnoreCase(tournament.getTournamentType())) {
            for (Match m : allLeagueMatches) {
                m.setStatus("WAITING_FOR_LINEUPS");
            }
        }

        // 3. Save all league matches
        allLeagueMatches = matchRepository.saveAll(allLeagueMatches);

        if ("TEAM_EVENT".equalsIgnoreCase(tournament.getTournamentType())) {
            teamEventFixtureGenerator.generateCategoryMatchesForFixtures(tournament.getTournamentId(), allLeagueMatches);
        }

        return draw;
    }

    @Transactional
    public Draw orchestrateLeaguePlayoffs(UUID tournamentUuid, Long createdBy) {
        Tournament tournament = tournamentRepository.findByTournamentUuid(tournamentUuid)
                .orElseThrow(() -> new IllegalArgumentException("Tournament not found"));

        List<Registration> allRegistrations = registrationRepository.findByTournamentIdAndStatus(tournament.getTournamentId(), "APPROVED");
        
        // 1. Check if playoffs have already been generated
        List<Draw> existingDraws = drawRepository.findByTournamentId(tournament.getTournamentId());
        boolean hasPlayoffs = existingDraws.stream().anyMatch(d -> "PLAYOFFS".equalsIgnoreCase(d.getDrawType()));
        if (hasPlayoffs) {
            throw new IllegalStateException("Playoffs have already been generated for this tournament.");
        }

        // 2. Get standings
        List<PoolStandingDTO> allStandings = standingsService.getStandingsForTournament(tournamentUuid);
        if (allStandings == null || allStandings.isEmpty()) {
            throw new IllegalStateException("No standings found. Cannot generate playoffs.");
        }

        // 3. Group by poolId and sort within each pool by rank
        Map<Long, List<PoolStandingDTO>> poolGroups = allStandings.stream()
                .collect(Collectors.groupingBy(PoolStandingDTO::getPoolId));
        
        List<List<PoolStandingDTO>> sortedPools = new ArrayList<>(poolGroups.values());
        for (List<PoolStandingDTO> poolStandings : sortedPools) {
            poolStandings.sort(Comparator.comparingInt(PoolStandingDTO::getRank));
        }
        // Sort pools alphabetically by pool name (e.g. "Pool A" first, "Pool B" second)
        sortedPools.sort(Comparator.comparing(p -> p.isEmpty() || p.get(0).getPoolName() == null ? "" : p.get(0).getPoolName()));

        List<ManualDrawRequest.ManualPairing> pairings = new ArrayList<>();

        if (sortedPools.size() == 2) {
            List<PoolStandingDTO> poolA = sortedPools.get(0);
            List<PoolStandingDTO> poolB = sortedPools.get(1);

            if (poolA.size() >= 2 && poolB.size() >= 2) {
                // Semi-Final 1 (Slot 1): Top 1st from Pool A vs Top 2nd from Pool B
                ManualDrawRequest.ManualPairing pair1 = new ManualDrawRequest.ManualPairing();
                pair1.setTeamAUuid(poolA.get(0).getTeamUuid()); // Pool A Rank 1
                pair1.setTeamBUuid(poolB.get(1).getTeamUuid()); // Pool B Rank 2
                pair1.setSlotIndex(1);
                pairings.add(pair1);

                // Semi-Final 2 (Slot 2): Top 1st from Pool B vs Top 2nd from Pool A
                ManualDrawRequest.ManualPairing pair2 = new ManualDrawRequest.ManualPairing();
                pair2.setTeamAUuid(poolB.get(0).getTeamUuid()); // Pool B Rank 1
                pair2.setTeamBUuid(poolA.get(1).getTeamUuid()); // Pool A Rank 2
                pair2.setSlotIndex(2);
                pairings.add(pair2);
            }
        } else if (sortedPools.size() > 2) {
            int k = sortedPools.size();
            for (int j = 0; j < k; j++) {
                List<PoolStandingDTO> poolCurr = sortedPools.get(j);
                List<PoolStandingDTO> poolNext = sortedPools.get((j + 1) % k);

                if (!poolCurr.isEmpty() && poolNext.size() > 1) {
                    ManualDrawRequest.ManualPairing pair = new ManualDrawRequest.ManualPairing();
                    pair.setTeamAUuid(poolCurr.get(0).getTeamUuid()); // 1st of current pool
                    pair.setTeamBUuid(poolNext.get(1).getTeamUuid()); // 2nd of next pool
                    pair.setSlotIndex(j + 1);
                    pairings.add(pair);
                }
            }
        } else if (sortedPools.size() == 1) {
            // Single pool: top 4 (1 vs 4, 2 vs 3) or top 2 (1 vs 2)
            List<PoolStandingDTO> pool = sortedPools.get(0);
            if (pool.size() >= 4) {
                ManualDrawRequest.ManualPairing pair1 = new ManualDrawRequest.ManualPairing();
                pair1.setTeamAUuid(pool.get(0).getTeamUuid());
                pair1.setTeamBUuid(pool.get(3).getTeamUuid());
                pair1.setSlotIndex(1);
                pairings.add(pair1);

                ManualDrawRequest.ManualPairing pair2 = new ManualDrawRequest.ManualPairing();
                pair2.setTeamAUuid(pool.get(1).getTeamUuid());
                pair2.setTeamBUuid(pool.get(2).getTeamUuid());
                pair2.setSlotIndex(2);
                pairings.add(pair2);
            } else if (pool.size() >= 2) {
                ManualDrawRequest.ManualPairing pair1 = new ManualDrawRequest.ManualPairing();
                pair1.setTeamAUuid(pool.get(0).getTeamUuid());
                pair1.setTeamBUuid(pool.get(1).getTeamUuid());
                pair1.setSlotIndex(1);
                pairings.add(pair1);
            }
        }

        if (pairings.isEmpty()) {
            throw new IllegalStateException("Not enough teams/standings to generate playoffs.");
        }

        ManualDrawRequest request = new ManualDrawRequest();
        request.setDrawType("KNOCKOUT");
        request.setPairings(pairings);

        Long categoryId = 1L;
        List<Match> generatedMatches = manualKnockoutFixtureGenerator.generateFixtures(
                allRegistrations, request, categoryId, createdBy, tournament.getTournamentId(), tournament.getTournamentUuid()
        );

        if ("TEAM_EVENT".equalsIgnoreCase(tournament.getTournamentType())) {
            for (Match m : generatedMatches) {
                m.setStatus("WAITING_FOR_LINEUPS");
            }
        }

        generatedMatches = matchRepository.saveAll(generatedMatches);

        if ("TEAM_EVENT".equalsIgnoreCase(tournament.getTournamentType())) {
            teamEventFixtureGenerator.generateCategoryMatchesForFixtures(tournament.getTournamentId(), generatedMatches);
        }

        int drawSize = pairings.size() * 2;
        Draw playoffDraw = new Draw(tournament.getTournamentId(), categoryId, "PLAYOFFS", drawSize, createdBy);
        playoffDraw.setStatus("PUBLISHED");
        drawRepository.save(playoffDraw);

        return playoffDraw;
    }
}

