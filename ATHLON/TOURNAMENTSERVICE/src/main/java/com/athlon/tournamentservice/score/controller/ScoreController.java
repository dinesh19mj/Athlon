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
        
        Score response = scoreService.recordScoreEvent(matchId, event, sportType);
        return new ResponseEntity<>(ApiResponse.success("Score event recorded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/state/{matchId}")
    public ResponseEntity<ApiResponse<Score>> getScoreState(@PathVariable String matchId) {
        Score score = scoreService.getScoreState(matchId);
        return ResponseEntity.ok(ApiResponse.success("Score state fetched successfully", score));
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<Score>> syncScoreState(
            @RequestParam("matchId") String matchId,
            @RequestBody com.fasterxml.jackson.databind.JsonNode state) {
        Score score = scoreService.syncScoreState(matchId, state);
        return ResponseEntity.ok(ApiResponse.success("Score state synced successfully", score));
    }
}

