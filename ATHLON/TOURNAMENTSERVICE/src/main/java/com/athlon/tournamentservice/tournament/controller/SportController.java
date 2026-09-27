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
import org.springframework.web.bind.annotation.RestController;

import com.athlon.tournamentservice.dto.request.SportCreateRequest;
import com.athlon.tournamentservice.dto.response.ApiResponse;
import com.athlon.tournamentservice.dto.response.SportResponse;
import com.athlon.tournamentservice.tournament.service.SportService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tournament/sports")
public class SportController {

    private final SportService sportService;

    public SportController(SportService sportService) {
        this.sportService = sportService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SportResponse>>> getAllActiveSports() {
        List<SportResponse> sports = sportService.getAllActiveSports();
        return ResponseEntity.ok(ApiResponse.success("Sports retrieved successfully", sports));
    }

    @GetMapping("/{sportUuid}")
    public ResponseEntity<ApiResponse<SportResponse>> getSportByUuid(@PathVariable("sportUuid") UUID sportUuid) {
        SportResponse response = sportService.getSportByUuid(sportUuid);
        return ResponseEntity.ok(ApiResponse.success("Sport retrieved successfully", response));
    }

    @GetMapping("/by-name/{sportName}")
    public ResponseEntity<ApiResponse<SportResponse>> getSportByName(@PathVariable("sportName") String sportName) {
        SportResponse response = sportService.getSportByName(sportName);
        return ResponseEntity.ok(ApiResponse.success("Sport retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SportResponse>> createSport(
            @Valid @RequestBody SportCreateRequest request) {
        SportResponse response = sportService.createSport(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sport created successfully", response));
    }
}
