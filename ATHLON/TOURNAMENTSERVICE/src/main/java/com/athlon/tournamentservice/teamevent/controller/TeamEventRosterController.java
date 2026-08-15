package com.athlon.tournamentservice.teamevent.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.tournamentservice.dto.response.ApiResponse;
import com.athlon.tournamentservice.teamevent.entity.TeamEventRosterPlayer;
import com.athlon.tournamentservice.teamevent.service.TeamEventRosterService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/tournament/team-events/roster")
public class TeamEventRosterController {

    private static final Logger log = LoggerFactory.getLogger(TeamEventRosterController.class);

    @Autowired
    private TeamEventRosterService rosterService;

    @GetMapping("/{registrationUuid}")
    public ResponseEntity<ApiResponse<List<TeamEventRosterPlayer>>> getTeamRoster(@PathVariable("registrationUuid") UUID registrationUuid) {
        log.info("Fetching roster for team registration UUID: {}", registrationUuid);
        List<TeamEventRosterPlayer> roster = rosterService.getTeamRoster(registrationUuid);
        return ResponseEntity.ok(ApiResponse.success("Team roster fetched successfully", roster));
    }

    @PostMapping("/{registrationUuid}/players")
    public ResponseEntity<ApiResponse<List<TeamEventRosterPlayer>>> addPlayersToRoster(
            @PathVariable("registrationUuid") UUID registrationUuid,
            @RequestBody List<TeamEventRosterPlayer> newPlayers,
            @RequestParam(value = "updatedBy", required = false) Long updatedBy) {
        
        log.info("Adding {} players to team registration UUID: {}", newPlayers.size(), registrationUuid);
        List<TeamEventRosterPlayer> updatedRoster = rosterService.addPlayersToRoster(registrationUuid, newPlayers, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Players added to roster successfully", updatedRoster));
    }
}
