package com.athlon.tournamentservice.teamchampionship.service;

import com.athlon.tournamentservice.teamchampionship.entity.*;
import com.athlon.tournamentservice.teamchampionship.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class TeamChampionshipFixtureService {

    private final TeamChampionshipRepository championshipRepository;
    private final ChampionshipTeamRegistrationRepository teamRegistrationRepository;
    private final ChampionshipEventRepository eventRepository;
    private final TeamChampionshipPoolRepository poolRepository;
    private final TeamChampionshipFixtureRepository fixtureRepository;
    private final TeamChampionshipSubMatchRepository subMatchRepository;

    @Autowired
    public TeamChampionshipFixtureService(
            TeamChampionshipRepository championshipRepository,
            ChampionshipTeamRegistrationRepository teamRegistrationRepository,
            ChampionshipEventRepository eventRepository,
            TeamChampionshipPoolRepository poolRepository,
            TeamChampionshipFixtureRepository fixtureRepository,
            TeamChampionshipSubMatchRepository subMatchRepository) {
        this.championshipRepository = championshipRepository;
        this.teamRegistrationRepository = teamRegistrationRepository;
        this.eventRepository = eventRepository;
        this.poolRepository = poolRepository;
        this.fixtureRepository = fixtureRepository;
        this.subMatchRepository = subMatchRepository;
    }

    @Transactional
    public List<TeamChampionshipFixture> generatePoolFixtures(Long championshipId, int numberOfPools) {
        TeamChampionship championship = championshipRepository.findById(championshipId)
                .orElseThrow(() -> new IllegalArgumentException("Championship not found"));

        List<ChampionshipTeamRegistration> teams = teamRegistrationRepository.findByChampionshipIdAndStatus(championshipId, "APPROVED");
        if (teams.size() < 2) {
            throw new IllegalStateException("At least 2 approved teams required to generate fixtures");
        }

        // 1. Clear old fixtures and sub-matches for this championship
        List<TeamChampionshipFixture> oldFixtures = fixtureRepository.findByChampionshipId(championshipId);
        for (TeamChampionshipFixture f : oldFixtures) {
            subMatchRepository.deleteByFixtureId(f.getFixtureId());
        }
        fixtureRepository.deleteByChampionshipId(championshipId);

        // 2. Fetch events/categories for sub-match generation
        List<ChampionshipEvent> events = eventRepository.findByChampionshipIdOrderByDisplayOrderAsc(championshipId);

        // 3. Create Pools & Partition Teams
        List<TeamChampionshipFixture> generatedFixtures = new ArrayList<>();
        int poolsCount = Math.max(1, numberOfPools);

        List<List<ChampionshipTeamRegistration>> poolBuckets = new ArrayList<>();
        for (int i = 0; i < poolsCount; i++) {
            poolBuckets.add(new ArrayList<>());
        }

        for (int i = 0; i < teams.size(); i++) {
            poolBuckets.get(i % poolsCount).add(teams.get(i));
        }

        for (int p = 0; p < poolsCount; p++) {
            List<ChampionshipTeamRegistration> poolTeams = poolBuckets.get(p);
            if (poolTeams.size() < 2) continue;

            String poolName = poolsCount == 1 ? "All Teams Pool" : "Pool " + (char) ('A' + p);
            TeamChampionshipPool pool = new TeamChampionshipPool();
            pool.setChampionshipId(championship.getChampionshipId());
            pool.setChampionshipUuid(championship.getChampionshipUuid());
            pool.setPoolName(poolName);
            pool.setStage("LEAGUE");
            pool.setQualifiersCount(2);
            TeamChampionshipPool savedPool = poolRepository.save(pool);

            // Generate Round-Robin Pairings
            int n = poolTeams.size();
            boolean isOdd = (n % 2 != 0);
            int totalRounds = isOdd ? n : n - 1;
            List<ChampionshipTeamRegistration> list = new ArrayList<>(poolTeams);
            if (isOdd) {
                list.add(null); // Bye
                n++;
            }

            int roundCounter = 1;
            for (int round = 0; round < n - 1; round++) {
                for (int i = 0; i < n / 2; i++) {
                    ChampionshipTeamRegistration t1 = list.get(i);
                    ChampionshipTeamRegistration t2 = list.get(n - 1 - i);

                    if (t1 != null && t2 != null) {
                        TeamChampionshipFixture fixture = new TeamChampionshipFixture();
                        fixture.setChampionshipId(championship.getChampionshipId());
                        fixture.setChampionshipUuid(championship.getChampionshipUuid());
                        fixture.setPoolId(savedPool.getPoolId());
                        fixture.setRoundName("Round " + roundCounter);
                        fixture.setStage("LEAGUE");
                        fixture.setTeamAId(t1.getTeamId());
                        fixture.setTeamAName(t1.getTeamName());
                        fixture.setTeamBId(t2.getTeamId());
                        fixture.setTeamBName(t2.getTeamName());
                        fixture.setStatus("SCHEDULED");
                        fixture.setCategoryOrderMode("ORGANIZER_DEFINED");

                        TeamChampionshipFixture savedFixture = fixtureRepository.save(fixture);
                        generatedFixtures.add(savedFixture);

                        // Generate Sub-Matches for this Tie based on configured Events
                        int order = 1;
                        for (ChampionshipEvent ev : events) {
                            TeamChampionshipSubMatch subMatch = new TeamChampionshipSubMatch();
                            subMatch.setFixtureId(savedFixture.getFixtureId());
                            subMatch.setChampionshipId(championship.getChampionshipId());
                            subMatch.setEventId(ev.getEventId());
                            subMatch.setEventName(ev.getEventName());
                            subMatch.setCategoryId(ev.getCategoryId());
                            subMatch.setCategoryName(ev.getCategoryName());
                            subMatch.setFormatId(ev.getFormatId());
                            subMatch.setFormatName(ev.getFormatName());
                            subMatch.setOrderSequence(order++);
                            subMatch.setStatus("SCHEDULED");
                            subMatchRepository.save(subMatch);
                        }
                    }
                }

                // Rotate teams
                ChampionshipTeamRegistration last = list.remove(list.size() - 1);
                list.add(1, last);
                roundCounter++;
            }
        }

        championship.setStage("POOLS_SCHEDULED");
        championshipRepository.save(championship);

        return generatedFixtures;
    }

    public List<TeamChampionshipFixture> getFixturesByChampionship(UUID championshipUuid) {
        return fixtureRepository.findByChampionshipUuid(championshipUuid);
    }

    public List<TeamChampionshipSubMatch> getSubMatchesForFixture(Long fixtureId) {
        return subMatchRepository.findByFixtureIdOrderByOrderSequenceAsc(fixtureId);
    }

    public List<TeamChampionshipPool> getPoolsByChampionship(UUID championshipUuid) {
        return poolRepository.findByChampionshipUuid(championshipUuid);
    }
}
