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
import java.util.Collections;
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
    private final com.athlon.tournamentservice.drawengine.fixture.PooledKnockoutFixtureGenerator pooledKnockoutFixtureGenerator;
    private final com.athlon.tournamentservice.teamevent.service.TeamEventFixtureGenerator teamEventFixtureGenerator;

    @Autowired
    public DrawEngineService(
            TournamentRepository tournamentRepository,
            RegistrationRepository registrationRepository,
            DrawValidationEngine validationEngine,
            KnockoutFixtureGenerator knockoutFixtureGenerator,
            com.athlon.tournamentservice.drawengine.fixture.ManualKnockoutFixtureGenerator manualKnockoutFixtureGenerator,
            com.athlon.tournamentservice.drawengine.fixture.PooledKnockoutFixtureGenerator pooledKnockoutFixtureGenerator,
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
        this.pooledKnockoutFixtureGenerator = pooledKnockoutFixtureGenerator;
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

    @Transactional
    public Draw orchestratePooledKnockoutDraw(UUID tournamentUuid, com.athlon.tournamentservice.dto.request.PooledKnockoutDrawRequest request, Long createdBy) {
        Tournament tournament = tournamentRepository.findByTournamentUuid(tournamentUuid)
                .orElseThrow(() -> new IllegalArgumentException("Tournament not found"));

        List<Registration> allRegistrations = registrationRepository.findByTournamentIdAndStatus(tournament.getTournamentId(), "APPROVED");

        Long categoryId = request.getCategoryId() != null ? request.getCategoryId() : 1L;
        
        // 1. Calculate total teams
        int totalTeams = 0;
        if (request.getPools() != null) {
            for (com.athlon.tournamentservice.dto.request.PooledKnockoutDrawRequest.PoolAssignmentDTO poolDto : request.getPools()) {
                if (poolDto.getRegistrationUuids() != null) {
                    totalTeams += poolDto.getRegistrationUuids().size();
                }
            }
        }

        Draw draw = new Draw(tournament.getTournamentId(), categoryId, "POOLED_KNOCKOUT", totalTeams, createdBy);
        draw.setStatus("PUBLISHED");
        draw = drawRepository.save(draw);

        List<Match> allPoolMatches = new ArrayList<>();

        // 2. Process each pool and generate its knockout tree
        if (request.getPools() != null) {
            for (com.athlon.tournamentservice.dto.request.PooledKnockoutDrawRequest.PoolAssignmentDTO poolDto : request.getPools()) {
                int capacity = poolDto.getRegistrationUuids() != null ? poolDto.getRegistrationUuids().size() : 0;
                Pool pool = new Pool(draw.getDrawId(), poolDto.getPoolName(), capacity, createdBy);
                pool = poolRepository.save(pool);

                List<Registration> poolTeams = new ArrayList<>();
                if (poolDto.getRegistrationUuids() != null) {
                    for (UUID teamUuid : poolDto.getRegistrationUuids()) {
                        Registration reg = allRegistrations.stream()
                                .filter(r -> r.getRegistrationUuid().equals(teamUuid))
                                .findFirst()
                                .orElseThrow(() -> new IllegalArgumentException("Team not found in approved registrations: " + teamUuid));

                        poolTeams.add(reg);

                        PoolTeam pt = new PoolTeam(pool.getPoolId(), reg.getRegistrationId());
                        poolTeamRepository.save(pt);
                    }
                }

                // Generate knockout fixtures for this pool
                int qualifiersCount = request.getQualifiersPerPool() > 0 ? request.getQualifiersPerPool() : 2;
                List<Match> poolMatches = pooledKnockoutFixtureGenerator.generateFixtures(
                        pool, poolTeams, categoryId, createdBy, tournament.getTournamentId(), tournament.getTournamentUuid(), qualifiersCount
                );

                allPoolMatches.addAll(poolMatches);
            }
        }

        matchRepository.saveAll(allPoolMatches);
        return draw;
    }

    @Transactional
    public Draw orchestratePooledPlayoffs(UUID tournamentUuid, com.athlon.tournamentservice.dto.request.PooledPlayoffsRequest request, Long createdBy) {
        Tournament tournament = tournamentRepository.findByTournamentUuid(tournamentUuid)
                .orElseThrow(() -> new IllegalArgumentException("Tournament not found"));

        List<Registration> allRegistrations = registrationRepository.findByTournamentIdAndStatus(tournament.getTournamentId(), "APPROVED");
        Map<Long, Registration> regById = allRegistrations.stream()
                .collect(Collectors.toMap(Registration::getRegistrationId, r -> r, (a, b) -> a));

        List<ManualDrawRequest.ManualPairing> pairings = new ArrayList<>();

        // Mode 1: Custom Manual Pairings configured by Organizer
        if (request != null && "CUSTOM_MANUAL".equalsIgnoreCase(request.getPairingMode()) && request.getCustomPairings() != null && !request.getCustomPairings().isEmpty()) {
            for (com.athlon.tournamentservice.dto.request.PooledPlayoffsRequest.CustomPlayoffMatchDTO cm : request.getCustomPairings()) {
                ManualDrawRequest.ManualPairing p = new ManualDrawRequest.ManualPairing();
                p.setSlotIndex(cm.getMatchOrder());
                if (cm.getPlayer1RegistrationId() != null && regById.containsKey(cm.getPlayer1RegistrationId())) {
                    p.setTeamAUuid(regById.get(cm.getPlayer1RegistrationId()).getRegistrationUuid());
                }
                if (cm.getPlayer2RegistrationId() != null && regById.containsKey(cm.getPlayer2RegistrationId())) {
                    p.setTeamBUuid(regById.get(cm.getPlayer2RegistrationId()).getRegistrationUuid());
                }
                pairings.add(p);
            }
        } else {
            // Mode 2: Standard Cross-Seeding between Pools (A1 vs B2, C1 vs D2, B1 vs A2, D1 vs C2)
            List<Draw> draws = drawRepository.findByTournamentId(tournament.getTournamentId());
            List<Pool> pools = new ArrayList<>();
            for (Draw d : draws) {
                pools.addAll(poolRepository.findByDrawId(d.getDrawId()));
            }

            // Find winners & runners-up per pool from completed matches
            List<Match> allMatches = matchRepository.findByTournamentUuid(tournament.getTournamentUuid());
            Map<Long, List<Match>> matchesByPool = allMatches.stream()
                    .filter(m -> m.getPoolId() != null)
                    .collect(Collectors.groupingBy(Match::getPoolId));

            List<List<Registration>> poolQualifiers = new ArrayList<>();
            for (Pool p : pools) {
                List<Match> poolM = matchesByPool.getOrDefault(p.getPoolId(), Collections.emptyList());
                List<Match> rootMatches = poolM.stream().filter(m -> m.getNextMatchUuid() == null).collect(Collectors.toList());
                List<Registration> qualifiers = new ArrayList<>();
                if (rootMatches.size() == 1) {
                    Match finalM = rootMatches.get(0);
                    if (finalM.getWinnerRegistrationId() != null) {
                        Registration winner = regById.get(finalM.getWinnerRegistrationId());
                        if (winner != null) qualifiers.add(winner);

                        Long runnerUpId = finalM.getWinnerRegistrationId().equals(finalM.getTeamARegistrationId())
                                ? finalM.getTeamBRegistrationId() : finalM.getTeamARegistrationId();
                        if (runnerUpId != null && regById.containsKey(runnerUpId)) {
                            qualifiers.add(regById.get(runnerUpId));
                        }
                    }
                } else {
                    for (Match rm : rootMatches) {
                        if (rm.getWinnerRegistrationId() != null) {
                            Registration winner = regById.get(rm.getWinnerRegistrationId());
                            if (winner != null) qualifiers.add(winner);
                        }
                    }
                }
                if (!qualifiers.isEmpty()) {
                    poolQualifiers.add(qualifiers);
                }
            }

            if (poolQualifiers.size() == 2) {
                List<Registration> pA = poolQualifiers.get(0);
                List<Registration> pB = poolQualifiers.get(1);

                ManualDrawRequest.ManualPairing p1 = new ManualDrawRequest.ManualPairing();
                p1.setTeamAUuid(pA.get(0).getRegistrationUuid()); // A1
                p1.setTeamBUuid(pB.size() > 1 ? pB.get(1).getRegistrationUuid() : null); // B2
                p1.setSlotIndex(1);
                pairings.add(p1);

                ManualDrawRequest.ManualPairing p2 = new ManualDrawRequest.ManualPairing();
                p2.setTeamAUuid(pB.get(0).getRegistrationUuid()); // B1
                p2.setTeamBUuid(pA.size() > 1 ? pA.get(1).getRegistrationUuid() : null); // A2
                p2.setSlotIndex(2);
                pairings.add(p2);
            } else if (poolQualifiers.size() >= 4) {
                List<Registration> pA = poolQualifiers.get(0);
                List<Registration> pB = poolQualifiers.get(1);
                List<Registration> pC = poolQualifiers.get(2);
                List<Registration> pD = poolQualifiers.get(3);

                ManualDrawRequest.ManualPairing p1 = new ManualDrawRequest.ManualPairing();
                p1.setTeamAUuid(pA.get(0).getRegistrationUuid());
                p1.setTeamBUuid(pB.size() > 1 ? pB.get(1).getRegistrationUuid() : null);
                p1.setSlotIndex(1);
                pairings.add(p1);

                ManualDrawRequest.ManualPairing p2 = new ManualDrawRequest.ManualPairing();
                p2.setTeamAUuid(pC.get(0).getRegistrationUuid());
                p2.setTeamBUuid(pD.size() > 1 ? pD.get(1).getRegistrationUuid() : null);
                p2.setSlotIndex(2);
                pairings.add(p2);

                ManualDrawRequest.ManualPairing p3 = new ManualDrawRequest.ManualPairing();
                p3.setTeamAUuid(pB.get(0).getRegistrationUuid());
                p3.setTeamBUuid(pA.size() > 1 ? pA.get(1).getRegistrationUuid() : null);
                p3.setSlotIndex(3);
                pairings.add(p3);

                ManualDrawRequest.ManualPairing p4 = new ManualDrawRequest.ManualPairing();
                p4.setTeamAUuid(pD.get(0).getRegistrationUuid());
                p4.setTeamBUuid(pC.size() > 1 ? pC.get(1).getRegistrationUuid() : null);
                p4.setSlotIndex(4);
                pairings.add(p4);
            }
        }

        if (pairings.isEmpty()) {
            throw new IllegalStateException("Unable to formulate playoff pairings. Ensure pools have completed matches or provide custom pairings.");
        }

        ManualDrawRequest drawReq = new ManualDrawRequest();
        drawReq.setDrawType("KNOCKOUT");
        drawReq.setPairings(pairings);

        Long categoryId = request != null && request.getCategoryId() != null ? request.getCategoryId() : 1L;
        List<Match> generatedMatches = manualKnockoutFixtureGenerator.generateFixtures(
                allRegistrations, drawReq, categoryId, createdBy, tournament.getTournamentId(), tournament.getTournamentUuid()
        );

        matchRepository.saveAll(generatedMatches);

        int drawSize = pairings.size() * 2;
        Draw playoffDraw = new Draw(tournament.getTournamentId(), categoryId, "POOLED_PLAYOFFS", drawSize, createdBy);
        playoffDraw.setStatus("PUBLISHED");
        return drawRepository.save(playoffDraw);
    }
}

