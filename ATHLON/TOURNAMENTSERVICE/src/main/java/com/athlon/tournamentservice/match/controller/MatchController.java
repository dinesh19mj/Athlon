package com.athlon.tournamentservice.match.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.tournamentservice.dto.request.MatchCreateRequest;
import com.athlon.tournamentservice.dto.response.ApiResponse;
import com.athlon.tournamentservice.dto.response.MatchResponse;
import com.athlon.tournamentservice.match.service.MatchService;

import jakarta.validation.Valid;

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
    public ResponseEntity<ApiResponse<MatchResponse>> getMatchByUuid(@PathVariable("uuid") UUID uuid) {
        MatchResponse response = matchService.getMatchByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.success("Match retrieved successfully", response));
    }

    @GetMapping("/tournament/{tournamentUuid}")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getMatchesByTournament(@PathVariable("tournamentUuid") UUID tournamentUuid) {
        List<MatchResponse> responses = matchService.getMatchesByTournament(tournamentUuid);
        return ResponseEntity.ok(ApiResponse.success("Matches retrieved successfully", responses));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getMatchesByUser(@PathVariable("userId") Long userId) {
        List<MatchResponse> responses = matchService.getMatchesByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Matches retrieved successfully", responses));
    }

    @PutMapping("/{uuid}/court")
    public ResponseEntity<ApiResponse<MatchResponse>> updateMatchCourt(
            @PathVariable("uuid") UUID uuid,
            @RequestParam("courtId") Long courtId) {
        MatchResponse response = matchService.updateMatchCourt(uuid, courtId);
        return ResponseEntity.ok(ApiResponse.success("Match court updated successfully", response));
    }

    @PutMapping("/{uuid}/umpire")
    public ResponseEntity<ApiResponse<MatchResponse>> updateMatchUmpire(
            @PathVariable("uuid") UUID uuid,
            @RequestParam("umpirePhone") String umpirePhone) {
        MatchResponse response = matchService.updateMatchUmpire(uuid, umpirePhone);
        return ResponseEntity.ok(ApiResponse.success("Match umpire updated successfully", response));
    }

    @PutMapping("/{uuid}/schedule")
    public ResponseEntity<ApiResponse<MatchResponse>> updateMatchSchedule(
            @PathVariable("uuid") UUID uuid,
            @RequestParam("scheduledTime") String scheduledTime) {
        java.time.LocalDateTime dateTime = java.time.LocalDateTime.parse(scheduledTime);
        MatchResponse response = matchService.updateMatchScheduledTime(uuid, dateTime);
        return ResponseEntity.ok(ApiResponse.success("Match schedule updated successfully", response));
    }

    @GetMapping("/umpire/{phone}")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getMatchesByUmpirePhone(@PathVariable("phone") String phone) {
        List<MatchResponse> responses = matchService.getMatchesByUmpirePhone(phone);
        return ResponseEntity.ok(ApiResponse.success("Umpire matches retrieved successfully", responses));
    }

    @PutMapping("/{uuid}/status")
    public ResponseEntity<ApiResponse<MatchResponse>> updateMatchStatus(
            @PathVariable("uuid") UUID uuid,
            @RequestParam("status") String status,
            @RequestParam(value = "winnerRegistrationId", required = false) Long winnerRegistrationId) {
        MatchResponse response = matchService.updateMatchStatus(uuid, status, winnerRegistrationId);
        return ResponseEntity.ok(ApiResponse.success("Match status updated successfully", response));
    }
}

