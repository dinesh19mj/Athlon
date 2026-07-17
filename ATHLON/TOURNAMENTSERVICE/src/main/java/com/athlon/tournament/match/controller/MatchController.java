package com.athlon.tournament.match.controller;

import com.athlon.tournament.dto.request.MatchCreateRequest;
import com.athlon.tournament.dto.response.ApiResponse;
import com.athlon.tournament.dto.response.MatchResponse;
import com.athlon.tournament.match.service.MatchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/tournament/matches")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<MatchResponse>> createMatch(@Valid @RequestBody MatchCreateRequest request) {
        MatchResponse response = matchService.createMatch(request);
        return new ResponseEntity<>(ApiResponse.success("Match created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/get/{uuid}")
    public ResponseEntity<ApiResponse<MatchResponse>> getMatchByUuid(@PathVariable UUID uuid) {
        MatchResponse response = matchService.getMatchByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.success("Match retrieved successfully", response));
    }
}
