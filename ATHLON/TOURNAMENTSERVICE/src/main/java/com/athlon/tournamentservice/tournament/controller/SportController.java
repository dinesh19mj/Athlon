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
        return ResponseEntity.ok(ApiResponse.success("Active sports retrieved successfully", sports));
    }

    @GetMapping("/getAllActiveSports")
    public ResponseEntity<ApiResponse<List<SportResponse>>> getActiveSportsList() {
        List<SportResponse> sports = sportService.getAllActiveSports();
        return ResponseEntity.ok(ApiResponse.success("Active sports retrieved successfully", sports));
    }

    @GetMapping("/getAllSports")
    public ResponseEntity<ApiResponse<List<SportResponse>>> getAllSports() {
        List<SportResponse> sports = sportService.getAllSports();
        return ResponseEntity.ok(ApiResponse.success("All sports retrieved successfully", sports));
    }

    @GetMapping("/getSportByUuid/{sportUuid}")
    public ResponseEntity<ApiResponse<SportResponse>> getSportByUuid(@PathVariable("sportUuid") UUID sportUuid) {
        SportResponse response = sportService.getSportByUuid(sportUuid);
        return ResponseEntity.ok(ApiResponse.success("Sport retrieved successfully", response));
    }

    @GetMapping("/getSportByName/{sportName}")
    public ResponseEntity<ApiResponse<SportResponse>> getSportByName(@PathVariable("sportName") String sportName) {
        SportResponse response = sportService.getSportByName(sportName);
        return ResponseEntity.ok(ApiResponse.success("Sport retrieved successfully", response));
    }

    @PostMapping("/createSport")
    public ResponseEntity<ApiResponse<SportResponse>> createSport(
            @Valid @RequestBody SportCreateRequest request) {
        SportResponse response = sportService.createSport(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sport created successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SportResponse>> createSportRoot(
            @Valid @RequestBody SportCreateRequest request) {
        SportResponse response = sportService.createSport(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sport created successfully", response));
    }

    @PostMapping("/updateSport/{sportUuid}")
    public ResponseEntity<ApiResponse<SportResponse>> updateSport(
            @PathVariable("sportUuid") UUID sportUuid,
            @Valid @RequestBody SportCreateRequest request) {
        SportResponse response = sportService.updateSport(sportUuid, request);
        return ResponseEntity.ok(ApiResponse.success("Sport updated successfully", response));
    }

    @PostMapping("/toggleSportStatus/{sportUuid}")
    public ResponseEntity<ApiResponse<SportResponse>> toggleSportStatus(
            @PathVariable("sportUuid") UUID sportUuid) {
        SportResponse response = sportService.toggleSportStatus(sportUuid);
        return ResponseEntity.ok(ApiResponse.success("Sport status toggled successfully", response));
    }
}
