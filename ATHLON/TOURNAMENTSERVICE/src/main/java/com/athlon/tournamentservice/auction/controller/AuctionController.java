package com.athlon.tournamentservice.auction.controller;

import com.athlon.tournamentservice.auction.dto.request.*;
import com.athlon.tournamentservice.auction.dto.response.AuctionStateDTO;
import com.athlon.tournamentservice.auction.dto.response.AuctionTeamSummaryDTO;
import com.athlon.tournamentservice.auction.entity.*;
import com.athlon.tournamentservice.auction.service.AuctionBiddingService;
import com.athlon.tournamentservice.auction.service.AuctionBudgetService;
import com.athlon.tournamentservice.auction.service.AuctionEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournament/auction")
public class AuctionController {

    private final AuctionEngineService engineService;
    private final AuctionBiddingService biddingService;
    private final AuctionBudgetService budgetService;

    @Autowired
    public AuctionController(
            AuctionEngineService engineService,
            AuctionBiddingService biddingService,
            AuctionBudgetService budgetService) {
        this.engineService = engineService;
        this.biddingService = biddingService;
        this.budgetService = budgetService;
    }

    @PostMapping("/config")
    public ResponseEntity<AuctionConfig> createOrUpdateConfig(@RequestBody CreateAuctionConfigRequest request) {
        return ResponseEntity.ok(engineService.createOrUpdateAuctionConfig(request));
    }

    @GetMapping("/{auctionId}/state")
    public ResponseEntity<AuctionStateDTO> getAuctionState(@PathVariable("auctionId") Long auctionId) {
        return ResponseEntity.ok(engineService.getAuctionState(auctionId));
    }

    @GetMapping("/{auctionId}/players")
    public ResponseEntity<List<AuctionPlayer>> getAuctionPlayers(@PathVariable("auctionId") Long auctionId) {
        return ResponseEntity.ok(engineService.getAuctionPlayers(auctionId));
    }

    @GetMapping("/{auctionId}/teams")
    public ResponseEntity<List<AuctionTeamSummaryDTO>> getAuctionTeams(@PathVariable("auctionId") Long auctionId) {
        return ResponseEntity.ok(engineService.getAuctionTeams(auctionId));
    }

    @PostMapping("/call-player")
    public ResponseEntity<AuctionStateDTO> callPlayer(@RequestBody CallPlayerRequest request) {
        return ResponseEntity.ok(engineService.callPlayer(request));
    }

    @PostMapping("/bid")
    public ResponseEntity<AuctionBid> placeBid(@RequestBody PlaceBidRequest request) {
        return ResponseEntity.ok(biddingService.placeBid(request));
    }

    @PostMapping("/unsold")
    public ResponseEntity<AuctionStateDTO> markUnsold(
            @RequestParam("auctionId") Long auctionId,
            @RequestParam("auctionPlayerId") Long auctionPlayerId) {
        return ResponseEntity.ok(engineService.markPlayerUnsold(auctionId, auctionPlayerId));
    }

    @PostMapping("/assign")
    public ResponseEntity<AuctionStateDTO> assignPlayer(@RequestBody AssignPlayerRequest request) {
        return ResponseEntity.ok(engineService.confirmPlayerAssignment(request));
    }

    @PostMapping("/reserved-player")
    public ResponseEntity<AuctionReservedPlayer> selectReservedPlayer(@RequestBody SelectReservedPlayerRequest request) {
        return ResponseEntity.ok(engineService.selectReservedPlayer(request));
    }

    @GetMapping("/{auctionId}/transactions")
    public ResponseEntity<List<AuctionBudgetTransaction>> getTransactions(@PathVariable("auctionId") Long auctionId) {
        return ResponseEntity.ok(budgetService.getAuctionTransactions(auctionId));
    }

    @GetMapping("/{auctionId}/transactions/team/{teamId}")
    public ResponseEntity<List<AuctionBudgetTransaction>> getTeamTransactions(
            @PathVariable("auctionId") Long auctionId,
            @PathVariable("teamId") Long teamId) {
        return ResponseEntity.ok(budgetService.getTeamTransactions(auctionId, teamId));
    }
}
