package com.athlon.tournamentservice.teamchampionship.controller;

import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipFixture;
import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipPool;
import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipSubMatch;
import com.athlon.tournamentservice.teamchampionship.service.TeamChampionshipFixtureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tournament/team-championship/fixtures")
public class TeamChampionshipFixtureController {

    private final TeamChampionshipFixtureService fixtureService;

    @Autowired
    public TeamChampionshipFixtureController(TeamChampionshipFixtureService fixtureService) {
        this.fixtureService = fixtureService;
    }

    @PostMapping("/generate-pools")
    public ResponseEntity<List<TeamChampionshipFixture>> generatePoolFixtures(
            @RequestParam("championshipId") Long championshipId,
            @RequestParam(value = "numberOfPools", defaultValue = "1") int numberOfPools) {
        return ResponseEntity.ok(fixtureService.generatePoolFixtures(championshipId, numberOfPools));
    }

    @GetMapping("/championship/{championshipUuid}")
    public ResponseEntity<List<TeamChampionshipFixture>> getFixtures(@PathVariable("championshipUuid") UUID championshipUuid) {
        return ResponseEntity.ok(fixtureService.getFixturesByChampionship(championshipUuid));
    }

    @GetMapping("/{fixtureId}/sub-matches")
    public ResponseEntity<List<TeamChampionshipSubMatch>> getSubMatches(@PathVariable("fixtureId") Long fixtureId) {
        return ResponseEntity.ok(fixtureService.getSubMatchesForFixture(fixtureId));
    }

    @GetMapping("/pools/{championshipUuid}")
    public ResponseEntity<List<TeamChampionshipPool>> getPools(@PathVariable("championshipUuid") UUID championshipUuid) {
        return ResponseEntity.ok(fixtureService.getPoolsByChampionship(championshipUuid));
    }
}
