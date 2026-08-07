package com.athlon.tournamentservice.tournament.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.athlon.tournamentservice.dto.request.TournamentCreateRequest;
import com.athlon.tournamentservice.dto.response.ApiResponse;
import com.athlon.tournamentservice.dto.response.TournamentResponse;
import com.athlon.tournamentservice.tournament.service.TournamentService;
import com.athlon.tournamentservice.util.DocumentUtil;

@RestController
@RequestMapping("/api/tournament/tournaments")
public class TournamentController {

    private final TournamentService tournamentService;
    private final DocumentUtil documentUtil;

    public TournamentController(TournamentService tournamentService, DocumentUtil documentUtil) {
        this.tournamentService = tournamentService;
        this.documentUtil = documentUtil;
    }

    @PostMapping(value = "/createTournament", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<TournamentResponse>> createTournament(TournamentCreateRequest request,
            @RequestParam(value = "poster", required = false) MultipartFile poster) throws IOException {
        
        TournamentResponse response = tournamentService.createTournament(request, poster);
        return new ResponseEntity<>(ApiResponse.success("Tournament created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/getTournamentByUuid/{uuid}")
    public ResponseEntity<ApiResponse<TournamentResponse>> getTournamentByUuid(@PathVariable("uuid") UUID uuid) {
        TournamentResponse response = tournamentService.getTournamentByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.success("Tournament retrieved successfully", response));
    }

    @GetMapping("/getAllActiveTournaments")
    public ResponseEntity<ApiResponse<List<TournamentResponse>>> getAllActiveTournaments() {
        List<TournamentResponse> response = tournamentService.getAllActiveTournaments();
        return ResponseEntity.ok(ApiResponse.success("Tournaments retrieved successfully", response));
    }

    @GetMapping("/getTournamentsByOrganizationUuid/{orgUuid}")
    public ResponseEntity<ApiResponse<List<TournamentResponse>>> getTournamentsByOrganizationUuid(@PathVariable("orgUuid") UUID orgUuid) {
        List<TournamentResponse> response = tournamentService.getTournamentsByOrganizationUuid(orgUuid);
        return ResponseEntity.ok(ApiResponse.success("Tournaments retrieved successfully", response));
    }

    @PostMapping("/deactivateTournament/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deactivateTournament(@PathVariable("uuid") UUID uuid) {
        tournamentService.deactivateTournament(uuid);
        return ResponseEntity.ok(ApiResponse.success("Tournament deactivated successfully", null));
    }

    @GetMapping("/getFile")
    public ResponseEntity<byte[]> getFile(@RequestParam("filePath") String filePath) {
        return documentUtil.getFile(filePath);
    }
}

