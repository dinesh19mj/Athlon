package com.athlon.tournamentservice.teamevent.controller;

import com.athlon.tournamentservice.teamevent.entity.TeamEventLineup;
import com.athlon.tournamentservice.teamevent.entity.TeamEventLineupPlayer;
import com.athlon.tournamentservice.teamevent.service.TeamEventLineupService;
import com.athlon.tournamentservice.teamevent.service.TeamEventScoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tournament/team-events")
public class TeamEventController {

    private final TeamEventLineupService lineupService;
    private final TeamEventScoringService scoringService;

    public TeamEventController(TeamEventLineupService lineupService, TeamEventScoringService scoringService) {
        this.lineupService = lineupService;
        this.scoringService = scoringService;
    }

    // --- FIXTURE DETAILS ENDPOINT ---
    @GetMapping("/fixture/{fixtureMatchId}/details")
    public ResponseEntity<?> getFixtureDetails(@PathVariable("fixtureMatchId") Long fixtureMatchId) {
        try {
            return ResponseEntity.ok(Map.of("success", true, "data", lineupService.getFixtureDetails(fixtureMatchId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // --- LINEUP ENDPOINTS ---

    @PostMapping("/lineup/submit/{fixtureMatchId}/{teamRegistrationId}")
    public ResponseEntity<?> submitLineup(
            @PathVariable("fixtureMatchId") Long fixtureMatchId,
            @PathVariable("teamRegistrationId") Long teamRegistrationId,
            @RequestBody List<TeamEventLineupPlayer> players,
            @RequestParam("submittedBy") Long submittedBy) {

        try {
            TeamEventLineup lineup = lineupService.submitLineup(fixtureMatchId, teamRegistrationId, players,
                    submittedBy);
            return ResponseEntity.ok(Map.of("success", true, "data", lineup));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/lineup/approve/{lineupId}")
    public ResponseEntity<?> approveLineup(
            @PathVariable("lineupId") Long lineupId,
            @RequestParam("approvedBy") Long approvedBy) {
        try {
            TeamEventLineup lineup = lineupService.approveLineup(lineupId, approvedBy);
            return ResponseEntity.ok(Map.of("success", true, "data", lineup));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/lineup/reject/{lineupId}")
    public ResponseEntity<?> rejectLineup(
            @PathVariable("lineupId") Long lineupId,
            @RequestBody Map<String, String> payload) {
        try {
            String reason = payload.get("reason");
            TeamEventLineup lineup = lineupService.rejectLineup(lineupId, reason);
            return ResponseEntity.ok(Map.of("success", true, "data", lineup));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // --- SCORING ENDPOINTS ---

    @PostMapping("/scoring/category/{categoryMatchId}")
    public ResponseEntity<?> submitCategoryScore(
            @PathVariable("categoryMatchId") Long categoryMatchId,
            @RequestBody Map<String, Object> payload) {
        try {
            Long winnerRegistrationId = payload.get("winnerRegistrationId") != null
                    ? Long.valueOf(payload.get("winnerRegistrationId").toString())
                    : null;
            String score = (String) payload.get("score");

            scoringService.submitCategoryMatchResult(categoryMatchId, winnerRegistrationId, score);
            return ResponseEntity
                    .ok(Map.of("success", true, "message", "Category match result submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
