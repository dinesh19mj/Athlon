package com.athlon.identityservice.organization.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.organization.dto.request.CreateAcademyMatchRequest;
import com.athlon.identityservice.organization.dto.request.UpdateAcademyMatchScoreRequest;
import com.athlon.identityservice.organization.dto.response.AcademyMatchResponse;
import com.athlon.identityservice.organization.service.AcademyMatchService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/academy/matches")
public class AcademyMatchController {

    private final AcademyMatchService matchService;

    public AcademyMatchController(AcademyMatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<AcademyMatchResponse>>> getMatches(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "sportType", required = false) String sportType,
            @RequestParam(value = "batchUuid", required = false) UUID batchUuid) {

        List<AcademyMatchResponse> list = matchService.getMatches(organizationUuid, status, sportType, batchUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy matches retrieved successfully", list));
    }

    @GetMapping("/{matchUuid}")
    public ResponseEntity<ApiResponse<AcademyMatchResponse>> getMatchByUuid(
            @PathVariable("matchUuid") UUID matchUuid) {

        AcademyMatchResponse match = matchService.getMatchByUuid(matchUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy match retrieved successfully", match));
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<AcademyMatchResponse>> createMatch(
            @Valid @RequestBody CreateAcademyMatchRequest request) {

        AcademyMatchResponse match = matchService.createMatch(request, null);
        return ResponseEntity.ok(ApiResponse.success("Academy match created successfully", match));
    }

    @PostMapping("/update-score/{matchUuid}")
    public ResponseEntity<ApiResponse<AcademyMatchResponse>> updateScore(
            @PathVariable("matchUuid") UUID matchUuid,
            @RequestBody UpdateAcademyMatchScoreRequest request) {

        AcademyMatchResponse match = matchService.updateScore(matchUuid, request, null);
        return ResponseEntity.ok(ApiResponse.success("Match score updated successfully", match));
    }

    @PostMapping("/delete/{matchUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteMatch(
            @PathVariable("matchUuid") UUID matchUuid) {

        matchService.deleteMatch(matchUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy match deleted successfully", null));
    }
}
