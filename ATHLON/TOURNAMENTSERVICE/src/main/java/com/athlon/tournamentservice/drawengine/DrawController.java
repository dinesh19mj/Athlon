package com.athlon.tournamentservice.drawengine;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.athlon.tournamentservice.drawengine.entity.Draw;
import com.athlon.tournamentservice.drawengine.service.StandingsService;

import java.util.UUID;

@RestController
@RequestMapping("/api/tournament/draws")
public class DrawController {

    private final DrawEngineService drawEngineService;
    private final StandingsService standingsService;

    public DrawController(DrawEngineService drawEngineService, StandingsService standingsService) {
        this.drawEngineService = drawEngineService;
        this.standingsService = standingsService;
    }

    @PostMapping("/generate/{tournamentUuid}")
    public ResponseEntity<?> generateDraw(
            @PathVariable("tournamentUuid") UUID tournamentUuid, 
            @RequestParam("type") String type) {
        try {
            // Assume createdBy = 1L for now since we don't have auth context in this snippet
            Long createdBy = 1L; 
            
            com.athlon.tournamentservice.drawengine.entity.Draw draw = drawEngineService.orchestrateDraw(tournamentUuid, type, createdBy);
            return ResponseEntity.ok(draw);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/manual/{tournamentUuid}")
    public ResponseEntity<?> generateManualDraw(
            @PathVariable("tournamentUuid") UUID tournamentUuid,
            @org.springframework.web.bind.annotation.RequestBody com.athlon.tournamentservice.dto.request.ManualDrawRequest request) {
        try {
            Long createdBy = 1L; 
            com.athlon.tournamentservice.drawengine.entity.Draw draw = drawEngineService.orchestrateManualDraw(tournamentUuid, request, createdBy);
            return ResponseEntity.ok(draw);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/league/{tournamentUuid}")
    public ResponseEntity<?> generateLeagueDraw(
            @PathVariable("tournamentUuid") UUID tournamentUuid,
            @org.springframework.web.bind.annotation.RequestBody com.athlon.tournamentservice.dto.request.LeagueDrawRequest request) {
        try {
            Long createdBy = 1L;
            com.athlon.tournamentservice.drawengine.entity.Draw draw = drawEngineService.orchestrateLeagueDraw(tournamentUuid, request, createdBy);
            return ResponseEntity.ok(draw);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/league-playoffs/{tournamentUuid}")
    public ResponseEntity<?> generateLeaguePlayoffs(
            @PathVariable("tournamentUuid") UUID tournamentUuid) {
        try {
            Long createdBy = 1L;
            com.athlon.tournamentservice.drawengine.entity.Draw draw = drawEngineService.orchestrateLeaguePlayoffs(tournamentUuid, createdBy);
            return ResponseEntity.ok(draw);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/standings/{tournamentUuid}")
    public ResponseEntity<?> getStandings(@PathVariable("tournamentUuid") UUID tournamentUuid) {
        try {
            return ResponseEntity.ok(standingsService.getStandingsForTournament(tournamentUuid));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{tournamentUuid}")
    public ResponseEntity<?> deleteDraw(@PathVariable("tournamentUuid") UUID tournamentUuid) {
        try {
            drawEngineService.deleteDraw(tournamentUuid);
            return ResponseEntity.ok("Draw deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
