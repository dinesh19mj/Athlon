package com.athlon.tournamentservice.streaming.controller;

import com.athlon.tournamentservice.dto.response.ApiResponse;
import com.athlon.tournamentservice.streaming.entity.TournamentStreamConfig;
import com.athlon.tournamentservice.streaming.service.TournamentStreamConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tournament/stream-config")
public class TournamentStreamConfigController {

    private final TournamentStreamConfigService service;

    public TournamentStreamConfigController(TournamentStreamConfigService service) {
        this.service = service;
    }

    @GetMapping("/{tournamentUuid}")
    public ResponseEntity<ApiResponse<List<TournamentStreamConfig>>> getConfigs(@PathVariable("tournamentUuid") UUID tournamentUuid) {
        List<TournamentStreamConfig> configs = service.getConfigsByTournament(tournamentUuid);
        return ResponseEntity.ok(ApiResponse.success("Configs retrieved", configs));
    }

    @PostMapping("/{tournamentUuid}")
    public ResponseEntity<ApiResponse<List<TournamentStreamConfig>>> saveConfigs(
            @PathVariable("tournamentUuid") UUID tournamentUuid,
            @RequestBody List<TournamentStreamConfig> configs) {
        List<TournamentStreamConfig> saved = service.saveConfigs(tournamentUuid, configs);
        return ResponseEntity.ok(ApiResponse.success("Configs saved", saved));
    }
}
