package com.athlon.tournamentservice.tournament.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.tournamentservice.dto.request.TournamentMatchFormatCreateRequest;
import com.athlon.tournamentservice.dto.response.ApiResponse;
import com.athlon.tournamentservice.dto.response.TournamentMatchFormatResponse;
import com.athlon.tournamentservice.tournament.service.TournamentMatchFormatService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tournament/match-formats")
public class MatchFormatController {

    private final TournamentMatchFormatService formatService;

    public MatchFormatController(TournamentMatchFormatService formatService) {
        this.formatService = formatService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TournamentMatchFormatResponse>>> getMatchFormats(
            @RequestParam(value = "sportType", required = false) String sportType) {
        List<TournamentMatchFormatResponse> formats = formatService.getFormatsBySport(sportType);
        return ResponseEntity.ok(ApiResponse.success("Match formats retrieved successfully", formats));
    }

    @GetMapping("/{formatUuid}")
    public ResponseEntity<ApiResponse<TournamentMatchFormatResponse>> getFormatByUuid(
            @PathVariable("formatUuid") UUID formatUuid) {
        TournamentMatchFormatResponse response = formatService.getFormatByUuid(formatUuid);
        return ResponseEntity.ok(ApiResponse.success("Match format retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TournamentMatchFormatResponse>> createFormat(
            @Valid @RequestBody TournamentMatchFormatCreateRequest request) {
        TournamentMatchFormatResponse response = formatService.createFormat(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Match format created successfully", response));
    }
}
