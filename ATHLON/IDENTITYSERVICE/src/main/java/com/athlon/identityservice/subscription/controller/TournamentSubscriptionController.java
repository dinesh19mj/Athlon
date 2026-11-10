package com.athlon.identityservice.subscription.controller;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.subscription.dto.OrganizerCreditWalletDto;
import com.athlon.identityservice.subscription.dto.TournamentSubscriptionPlanDto;
import com.athlon.identityservice.subscription.dto.request.ConsumeAuctionCreditRequest;
import com.athlon.identityservice.subscription.dto.request.ConsumeTournamentCreditRequest;
import com.athlon.identityservice.subscription.dto.request.RefundTournamentCreditRequest;
import com.athlon.identityservice.subscription.dto.request.TopupCreditRequest;
import com.athlon.identityservice.subscription.dto.response.TournamentCreditTransactionDto;
import com.athlon.identityservice.subscription.entity.AuctionCreditActivation;
import com.athlon.identityservice.subscription.entity.TournamentCreditAllocation;
import com.athlon.identityservice.subscription.service.TournamentEntitlementService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/identity/subscriptions/organizer")
public class TournamentSubscriptionController {

    private final TournamentEntitlementService entitlementService;

    public TournamentSubscriptionController(TournamentEntitlementService entitlementService) {
        this.entitlementService = entitlementService;
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<TournamentSubscriptionPlanDto>>> getOrganizerPlans() {
        List<TournamentSubscriptionPlanDto> plans = entitlementService.getAllTournamentPlans();
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    @GetMapping("/{orgUuid}/wallet")
    public ResponseEntity<ApiResponse<OrganizerCreditWalletDto>> getWallet(@PathVariable("orgUuid") UUID orgUuid) {
        OrganizerCreditWalletDto wallet = entitlementService.getWalletByOrgUuid(orgUuid);
        return ResponseEntity.ok(ApiResponse.success(wallet));
    }

    @GetMapping("/by-id/{orgId}/wallet")
    public ResponseEntity<ApiResponse<OrganizerCreditWalletDto>> getWalletById(@PathVariable("orgId") Long orgId) {
        OrganizerCreditWalletDto wallet = entitlementService.getWalletByOrgId(orgId);
        return ResponseEntity.ok(ApiResponse.success(wallet));
    }

    @PostMapping("/consume-tournament-credit")
    public ResponseEntity<ApiResponse<TournamentCreditAllocation>> consumeTournamentCredit(
            @Valid @RequestBody ConsumeTournamentCreditRequest request) {
        TournamentCreditAllocation allocation = entitlementService.consumeTournamentCredit(request);
        return ResponseEntity.ok(ApiResponse.success("Tournament publication credit consumed successfully", allocation));
    }

    @PostMapping("/consume-auction-credit")
    public ResponseEntity<ApiResponse<AuctionCreditActivation>> consumeAuctionCredit(
            @Valid @RequestBody ConsumeAuctionCreditRequest request) {
        AuctionCreditActivation activation = entitlementService.activateLiveAuction(request);
        return ResponseEntity.ok(ApiResponse.success("Live auction activated successfully", activation));
    }

    @PostMapping("/refund-tournament-credit")
    public ResponseEntity<ApiResponse<TournamentCreditAllocation>> refundTournamentCredit(
            @Valid @RequestBody RefundTournamentCreditRequest request) {
        TournamentCreditAllocation allocation = entitlementService.refundTournamentCredit(request);
        return ResponseEntity.ok(ApiResponse.success("Tournament credit refunded successfully", allocation));
    }

    @PostMapping("/topup-credits")
    public ResponseEntity<ApiResponse<OrganizerCreditWalletDto>> topupCredits(
            @Valid @RequestBody TopupCreditRequest request) {
        OrganizerCreditWalletDto wallet = entitlementService.topupCredits(request);
        return ResponseEntity.ok(ApiResponse.success("Credits topped up successfully", wallet));
    }

    @GetMapping("/{orgId}/transactions")
    public ResponseEntity<ApiResponse<Page<TournamentCreditTransactionDto>>> getTransactions(
            @PathVariable("orgId") Long orgId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<TournamentCreditTransactionDto> transactions = entitlementService.getTransactions(orgId, pageable);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    @GetMapping("/tournaments/{tournamentUuid}/allocation")
    public ResponseEntity<ApiResponse<TournamentCreditAllocation>> getTournamentAllocation(
            @PathVariable("tournamentUuid") String tournamentUuid) {
        return ResponseEntity.ok(ApiResponse.success(entitlementService.getTournamentAllocation(tournamentUuid).orElse(null)));
    }

    @GetMapping("/tournaments/{tournamentUuid}/auction-activation")
    public ResponseEntity<ApiResponse<AuctionCreditActivation>> getAuctionActivation(
            @PathVariable("tournamentUuid") String tournamentUuid) {
        return ResponseEntity.ok(ApiResponse.success(entitlementService.getAuctionActivation(tournamentUuid).orElse(null)));
    }
}

