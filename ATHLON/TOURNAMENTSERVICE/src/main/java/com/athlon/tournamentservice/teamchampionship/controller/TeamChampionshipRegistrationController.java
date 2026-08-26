package com.athlon.tournamentservice.teamchampionship.controller;

import com.athlon.tournamentservice.teamchampionship.dto.request.PlayerRegistrationRequest;
import com.athlon.tournamentservice.teamchampionship.dto.request.TeamRegistrationRequest;
import com.athlon.tournamentservice.teamchampionship.dto.response.TeamSquadResponseDTO;
import com.athlon.tournamentservice.teamchampionship.entity.ChampionshipPlayerRegistration;
import com.athlon.tournamentservice.teamchampionship.entity.ChampionshipSquad;
import com.athlon.tournamentservice.teamchampionship.entity.ChampionshipTeamRegistration;
import com.athlon.tournamentservice.teamchampionship.service.ChampionshipRegistrationService;
import com.athlon.tournamentservice.teamchampionship.service.TeamChampionshipStandingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tournament/team-championship/registrations")
public class TeamChampionshipRegistrationController {

    private final ChampionshipRegistrationService registrationService;
    private final TeamChampionshipStandingsService standingsService;

    @Autowired
    public TeamChampionshipRegistrationController(
            ChampionshipRegistrationService registrationService,
            TeamChampionshipStandingsService standingsService) {
        this.registrationService = registrationService;
        this.standingsService = standingsService;
    }

    @PostMapping("/team")
    public ResponseEntity<ChampionshipTeamRegistration> registerTeam(@RequestBody TeamRegistrationRequest request) {
        return ResponseEntity.ok(registrationService.registerTeam(request));
    }

    @PostMapping("/player")
    public ResponseEntity<ChampionshipPlayerRegistration> registerPlayer(@RequestBody PlayerRegistrationRequest request) {
        return ResponseEntity.ok(registrationService.registerPlayer(request));
    }

    @GetMapping("/teams/{championshipUuid}")
    public ResponseEntity<List<ChampionshipTeamRegistration>> getTeams(@PathVariable("championshipUuid") UUID championshipUuid) {
        return ResponseEntity.ok(registrationService.getTeamsByChampionship(championshipUuid));
    }

    @GetMapping("/players/{championshipUuid}")
    public ResponseEntity<List<ChampionshipPlayerRegistration>> getPlayers(@PathVariable("championshipUuid") UUID championshipUuid) {
        return ResponseEntity.ok(registrationService.getPlayersByChampionship(championshipUuid));
    }

    @GetMapping("/squad/{teamId}")
    public ResponseEntity<List<ChampionshipSquad>> getTeamSquad(@PathVariable("teamId") Long teamId) {
        return ResponseEntity.ok(registrationService.getTeamSquad(teamId));
    }

    @GetMapping("/squad/{teamId}/audit/{championshipId}")
    public ResponseEntity<TeamSquadResponseDTO> getSquadAudit(
            @PathVariable("teamId") Long teamId,
            @PathVariable("championshipId") Long championshipId) {
        return ResponseEntity.ok(standingsService.getTeamParticipationAudit(teamId, championshipId));
    }

    @PostMapping("/teams/{teamId}/payment-status")
    public ResponseEntity<ChampionshipTeamRegistration> updateTeamPayment(
            @PathVariable("teamId") Long teamId,
            @RequestParam("status") String status) {
        return ResponseEntity.ok(registrationService.updateTeamPaymentStatus(teamId, status));
    }

    @PostMapping("/players/{playerId}/payment-status")
    public ResponseEntity<ChampionshipPlayerRegistration> updatePlayerPayment(
            @PathVariable("playerId") Long playerId,
            @RequestParam("status") String status) {
        return ResponseEntity.ok(registrationService.updatePlayerPaymentStatus(playerId, status));
    }
}
