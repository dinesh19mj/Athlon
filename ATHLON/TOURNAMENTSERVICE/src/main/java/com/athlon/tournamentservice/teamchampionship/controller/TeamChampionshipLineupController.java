package com.athlon.tournamentservice.teamchampionship.controller;

import com.athlon.tournamentservice.teamchampionship.dto.request.RecordSubstitutionRequest;
import com.athlon.tournamentservice.teamchampionship.dto.request.RecordTossRequest;
import com.athlon.tournamentservice.teamchampionship.dto.request.SubmitLineupRequest;
import com.athlon.tournamentservice.teamchampionship.dto.response.LineupDetailDTO;
import com.athlon.tournamentservice.teamchampionship.dto.response.TeamFixtureDetailDTO;
import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipLineup;
import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipSubstitution;
import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipToss;
import com.athlon.tournamentservice.teamchampionship.service.TeamChampionshipLineupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournament/team-championship/lineups")
public class TeamChampionshipLineupController {

    private final TeamChampionshipLineupService lineupService;

    @Autowired
    public TeamChampionshipLineupController(TeamChampionshipLineupService lineupService) {
        this.lineupService = lineupService;
    }

    @PostMapping("/submit")
    public ResponseEntity<TeamChampionshipLineup> submitLineup(@RequestBody SubmitLineupRequest request) {
        return ResponseEntity.ok(lineupService.submitLineup(request));
    }

    @PostMapping("/{lineupId}/approve")
    public ResponseEntity<TeamChampionshipLineup> approveLineup(@PathVariable("lineupId") Long lineupId) {
        return ResponseEntity.ok(lineupService.approveLineup(lineupId));
    }

    @PostMapping("/{lineupId}/reject")
    public ResponseEntity<TeamChampionshipLineup> rejectLineup(
            @PathVariable("lineupId") Long lineupId,
            @RequestParam(value = "reason", defaultValue = "Incomplete lineup") String reason) {
        return ResponseEntity.ok(lineupService.rejectLineup(lineupId, reason));
    }

    @PostMapping("/toss")
    public ResponseEntity<TeamChampionshipToss> recordToss(@RequestBody RecordTossRequest request) {
        return ResponseEntity.ok(lineupService.recordToss(request));
    }

    @PostMapping("/substitutions")
    public ResponseEntity<TeamChampionshipSubstitution> recordSubstitution(@RequestBody RecordSubstitutionRequest request) {
        return ResponseEntity.ok(lineupService.recordSubstitution(request));
    }

    @GetMapping("/fixture/{fixtureId}")
    public ResponseEntity<TeamFixtureDetailDTO> getFixtureDetail(
            @PathVariable("fixtureId") Long fixtureId,
            @RequestParam(value = "isOrganizer", defaultValue = "false") boolean isOrganizer) {
        return ResponseEntity.ok(lineupService.getFixtureDetail(fixtureId, isOrganizer));
    }

    @GetMapping("/fixture/{fixtureId}/list")
    public ResponseEntity<List<LineupDetailDTO>> getLineupsForFixture(@PathVariable("fixtureId") Long fixtureId) {
        return ResponseEntity.ok(lineupService.getLineupsForFixture(fixtureId));
    }
}
