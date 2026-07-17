package com.athlon.tournament.tournament.controller;

import com.athlon.tournament.dto.request.TournamentCreateRequest;
import com.athlon.tournament.dto.response.ApiResponse;
import com.athlon.tournament.dto.response.TournamentResponse;
import com.athlon.tournament.tournament.service.TournamentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tournament/tournaments")
public class TournamentController {

    private final TournamentService tournamentService;

    public TournamentController(TournamentService tournamentService) {
        this.tournamentService = tournamentService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<TournamentResponse>> createTournament(@Valid @RequestBody TournamentCreateRequest request) {
        TournamentResponse response = tournamentService.createTournament(request);
        return new ResponseEntity<>(ApiResponse.success("Tournament created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/get/{uuid}")
    public ResponseEntity<ApiResponse<TournamentResponse>> getTournamentByUuid(@PathVariable UUID uuid) {
        TournamentResponse response = tournamentService.getTournamentByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.success("Tournament retrieved successfully", response));
    }

    @GetMapping("/get-all")
    public ResponseEntity<ApiResponse<List<TournamentResponse>>> getAllActiveTournaments() {
        List<TournamentResponse> response = tournamentService.getAllActiveTournaments();
        return ResponseEntity.ok(ApiResponse.success("Tournaments retrieved successfully", response));
    }

    @PostMapping("/deactivate/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deactivateTournament(@PathVariable UUID uuid) {
        tournamentService.deactivateTournament(uuid);
        return ResponseEntity.ok(ApiResponse.success("Tournament deactivated successfully", null));
    }
}
