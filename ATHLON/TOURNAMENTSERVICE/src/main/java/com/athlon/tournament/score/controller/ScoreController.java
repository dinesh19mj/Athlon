package com.athlon.tournament.score.controller;

import com.athlon.tournament.dto.response.ApiResponse;
import com.athlon.tournament.score.entity.Score;
import com.athlon.tournament.score.entity.ScoreEvent;
import com.athlon.tournament.score.service.ScoreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tournament/scores")
public class ScoreController {

    private final ScoreService scoreService;

    public ScoreController(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    @PostMapping("/record-event")
    public ResponseEntity<ApiResponse<Score>> recordScoreEvent(
            @RequestParam("matchId") Long matchId,
            @RequestParam("sportType") String sportType,
            @RequestBody ScoreEvent event) {
        
        Score response = scoreService.recordScoreEvent(matchId, event, sportType);
        return new ResponseEntity<>(ApiResponse.success("Score event recorded successfully", response), HttpStatus.CREATED);
    }
}
