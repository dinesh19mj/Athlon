package com.athlon.tournamentservice.score.controller;

import com.athlon.tournamentservice.dto.response.ApiResponse;
import com.athlon.tournamentservice.score.entity.Score;
import com.athlon.tournamentservice.score.entity.ScoreEvent;
import com.athlon.tournamentservice.score.service.ScoreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

@RestController
@RequestMapping("/api/tournament/scores")
public class ScoreController {

    private final ScoreService scoreService;

    public ScoreController(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    @PostMapping("/record-event")
    public ResponseEntity<ApiResponse<Score>> recordScoreEvent(
            @RequestParam("matchId") String matchId,
            @RequestParam("sportType") String sportType,
            @RequestBody ScoreEvent event) {
        try {
            Score response = scoreService.recordScoreEvent(matchId, event, sportType);
            return new ResponseEntity<>(ApiResponse.success("Score event recorded successfully", response), HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Score event skipped: " + e.getMessage(), null));
        }
    }

    @GetMapping("/state/{matchId}")
    public ResponseEntity<ApiResponse<Score>> getScoreState(@PathVariable String matchId) {
        try {
            Score score = scoreService.getScoreState(matchId);
            return ResponseEntity.ok(ApiResponse.success("Score state fetched successfully", score));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("No score state found", null));
        }
    }

    @GetMapping("/sync-state/{matchId}")
    public ResponseEntity<ApiResponse<Score>> syncScoreStateGet(@PathVariable String matchId) {
        try {
            Score score = scoreService.getScoreState(matchId);
            return ResponseEntity.ok(ApiResponse.success("Score state fetched successfully", score));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("No score state found", null));
        }
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<Score>> syncScoreState(
            @RequestParam("matchId") String matchId,
            @RequestBody com.fasterxml.jackson.databind.JsonNode state) {
        try {
            Score score = scoreService.syncScoreState(matchId, state);
            return ResponseEntity.ok(ApiResponse.success("Score state synced successfully", score));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Score sync skipped: " + e.getMessage(), null));
        }
    }

    @GetMapping("/live")
    public ResponseEntity<ApiResponse<List<Score>>> getLiveScores() {
        List<Score> liveScores = scoreService.getLiveScores();
        return ResponseEntity.ok(ApiResponse.success("Live scores fetched successfully", liveScores));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Score>>> getAllScores() {
        try {
            List<Score> allScores = scoreService.getAllScores();
            return ResponseEntity.ok(ApiResponse.success("All scores fetched successfully", allScores));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Error fetching scores", java.util.Collections.emptyList()));
        }
    }
}

