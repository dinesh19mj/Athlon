package com.athlon.tournamentservice.teamchampionship.controller;

import com.athlon.tournamentservice.dto.response.ApiResponse;
import com.athlon.tournamentservice.teamchampionship.dto.request.CreateTeamChampionshipRequest;
import com.athlon.tournamentservice.teamchampionship.dto.response.StandingsRowDTO;
import com.athlon.tournamentservice.teamchampionship.dto.response.TeamChampionshipDetailDTO;
import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionship;
import com.athlon.tournamentservice.teamchampionship.service.TeamChampionshipService;
import com.athlon.tournamentservice.teamchampionship.service.TeamChampionshipStandingsService;
import com.athlon.tournamentservice.util.DocumentUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tournament/team-championship")
public class TeamChampionshipController {

    private final TeamChampionshipService championshipService;
    private final TeamChampionshipStandingsService standingsService;
    private final DocumentUtil documentUtil;
    private final ObjectMapper objectMapper;

    @Autowired
    public TeamChampionshipController(
            TeamChampionshipService championshipService,
            TeamChampionshipStandingsService standingsService,
            DocumentUtil documentUtil,
            ObjectMapper objectMapper) {
        this.championshipService = championshipService;
        this.standingsService = standingsService;
        this.documentUtil = documentUtil;
        this.objectMapper = objectMapper;
    }

    /**
     * Create Championship with Multipart poster upload and JSON request
     */
    @PostMapping(value = "/createChampionship", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<TeamChampionship>> createChampionship(
            @RequestParam("request") String requestJson,
            @RequestParam(value = "poster", required = false) MultipartFile poster) throws IOException {

        CreateTeamChampionshipRequest request = objectMapper.readValue(requestJson, CreateTeamChampionshipRequest.class);
        TeamChampionship created = championshipService.createChampionship(request, poster);
        return new ResponseEntity<>(ApiResponse.success("Team Championship created successfully", created), HttpStatus.CREATED);
    }

    /**
     * Fallback JSON-only create endpoint
     */
    @PostMapping(value = "/create", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<TeamChampionship>> createChampionshipJson(@RequestBody CreateTeamChampionshipRequest request) {
        TeamChampionship created = championshipService.createChampionship(request);
        return new ResponseEntity<>(ApiResponse.success("Team Championship created successfully", created), HttpStatus.CREATED);
    }

    @GetMapping("/getChampionshipByUuid/{championshipUuid}")
    public ResponseEntity<ApiResponse<TeamChampionshipDetailDTO>> getChampionshipByUuid(@PathVariable("championshipUuid") UUID championshipUuid) {
        TeamChampionshipDetailDTO detail = championshipService.getChampionshipDetail(championshipUuid);
        return ResponseEntity.ok(ApiResponse.success("Team Championship retrieved successfully", detail));
    }

    @GetMapping("/{championshipUuid}")
    public ResponseEntity<ApiResponse<TeamChampionshipDetailDTO>> getChampionshipDirect(@PathVariable("championshipUuid") UUID championshipUuid) {
        return getChampionshipByUuid(championshipUuid);
    }

    @GetMapping("/getChampionshipsByOrganizationUuid/{organizerUuid}")
    public ResponseEntity<ApiResponse<List<TeamChampionship>>> getChampionshipsByOrganizationUuid(@PathVariable("organizerUuid") UUID organizerUuid) {
        List<TeamChampionship> list = championshipService.getByOrganizer(organizerUuid);
        return ResponseEntity.ok(ApiResponse.success("Team Championships retrieved successfully", list));
    }

    @GetMapping("/organizer/{organizerUuid}")
    public ResponseEntity<ApiResponse<List<TeamChampionship>>> getByOrganizerDirect(@PathVariable("organizerUuid") UUID organizerUuid) {
        return getChampionshipsByOrganizationUuid(organizerUuid);
    }

    @GetMapping("/getAllActiveChampionships")
    public ResponseEntity<ApiResponse<List<TeamChampionship>>> getAllActiveChampionships() {
        List<TeamChampionship> list = championshipService.getAllPublic();
        return ResponseEntity.ok(ApiResponse.success("Active Team Championships retrieved successfully", list));
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<TeamChampionship>>> getAllPublicDirect() {
        return getAllActiveChampionships();
    }

    @PostMapping("/updateStage/{championshipUuid}")
    public ResponseEntity<ApiResponse<TeamChampionship>> updateStage(
            @PathVariable("championshipUuid") UUID championshipUuid,
            @RequestParam("stage") String stage) {
        TeamChampionship updated = championshipService.updateStage(championshipUuid, stage);
        return ResponseEntity.ok(ApiResponse.success("Championship stage updated successfully", updated));
    }

    @PostMapping("/{championshipUuid}/stage")
    public ResponseEntity<ApiResponse<TeamChampionship>> updateStageDirect(
            @PathVariable("championshipUuid") UUID championshipUuid,
            @RequestParam("stage") String stage) {
        return updateStage(championshipUuid, stage);
    }

    @GetMapping("/getStandings/{championshipUuid}")
    public ResponseEntity<ApiResponse<List<StandingsRowDTO>>> getStandings(@PathVariable("championshipUuid") UUID championshipUuid) {
        List<StandingsRowDTO> standings = standingsService.getStandingsForChampionship(championshipUuid);
        return ResponseEntity.ok(ApiResponse.success("Championship standings retrieved successfully", standings));
    }

    @GetMapping("/{championshipUuid}/standings")
    public ResponseEntity<ApiResponse<List<StandingsRowDTO>>> getStandingsDirect(@PathVariable("championshipUuid") UUID championshipUuid) {
        return getStandings(championshipUuid);
    }

    @GetMapping("/getFile")
    public ResponseEntity<byte[]> getFile(@RequestParam("filePath") String filePath) {
        return documentUtil.getFile(filePath);
    }
}
