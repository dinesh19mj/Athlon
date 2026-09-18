package com.athlon.identityservice.rewards.controller;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.exception.BadRequestException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.rewards.dto.request.AdminAdjustCreditRequest;
import com.athlon.identityservice.rewards.dto.request.ApplyReferralRequest;
import com.athlon.identityservice.rewards.dto.request.AwardTournamentCreditRequest;
import com.athlon.identityservice.rewards.dto.request.RedeemFreeTournamentRequest;
import com.athlon.identityservice.rewards.dto.request.RedeemOrganizerSubscriptionRequest;
import com.athlon.identityservice.rewards.dto.request.UpdateCreditRuleRequest;
import com.athlon.identityservice.rewards.dto.response.CreditRedemptionResponse;
import com.athlon.identityservice.rewards.dto.response.CreditRuleResponse;
import com.athlon.identityservice.rewards.dto.response.CreditTransactionResponse;
import com.athlon.identityservice.rewards.dto.response.UserReferralResponse;
import com.athlon.identityservice.rewards.dto.response.UserWalletResponse;
import com.athlon.identityservice.rewards.service.RewardsService;
import com.athlon.identityservice.user.entity.User;
import com.athlon.identityservice.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/rewards")
public class RewardsController {

    private static final Logger log = LoggerFactory.getLogger(RewardsController.class);

    private final RewardsService rewardsService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public RewardsController(RewardsService rewardsService, UserRepository userRepository) {
        this.rewardsService = rewardsService;
        this.userRepository = userRepository;
        this.objectMapper = new ObjectMapper();
    }

    private Long resolveUserId(Long headerUserId, UUID headerUserUuid, Long paramUserId, UUID paramUserUuid, String authHeader) {
        if (headerUserId != null) {
            return headerUserId;
        }
        if (paramUserId != null) {
            return paramUserId;
        }
        if (headerUserUuid != null) {
            return userRepository.findByUserUuid(headerUserUuid)
                    .map(User::getUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found for UUID: " + headerUserUuid));
        }
        if (paramUserUuid != null) {
            return userRepository.findByUserUuid(paramUserUuid)
                    .map(User::getUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found for UUID: " + paramUserUuid));
        }
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            try {
                String[] parts = token.split("\\.");
                if (parts.length >= 2) {
                    byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
                    JsonNode node = objectMapper.readTree(new String(decoded, StandardCharsets.UTF_8));

                    String uuidStr = node.has("userUuid") && !node.get("userUuid").isNull() ? node.get("userUuid").asText() : null;
                    if (uuidStr == null && node.has("sub") && !node.get("sub").isNull()) {
                        uuidStr = node.get("sub").asText();
                    }

                    if (uuidStr != null && !uuidStr.isBlank()) {
                        try {
                            UUID tokenUuid = UUID.fromString(uuidStr);
                            Optional<User> u = userRepository.findByUserUuid(tokenUuid);
                            if (u.isPresent()) {
                                return u.get().getUserId();
                            }
                        } catch (IllegalArgumentException e) {
                            if (uuidStr.matches("\\d+")) {
                                return Long.parseLong(uuidStr);
                            }
                        }
                    }

                    if (node.has("email") && !node.get("email").isNull()) {
                        String email = node.get("email").asText();
                        Optional<User> u = userRepository.findByEmail(email);
                        if (u.isPresent()) {
                            return u.get().getUserId();
                        }
                    }
                }
            } catch (Exception ex) {
                log.warn("Could not parse JWT token claims in RewardsController: {}", ex.getMessage());
            }
        }
        throw new BadRequestException("User authentication required. Please pass X-User-Id, X-User-Uuid, or Authorization token.");
    }

    // ── USER WALLET & REFERRALS ENDPOINTS ──────────────────────────────────────

    @GetMapping("/wallet")
    public ResponseEntity<ApiResponse<UserWalletResponse>> getWallet(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Uuid", required = false) UUID headerUserUuid,
            @RequestParam(value = "userId", required = false) Long paramUserId,
            @RequestParam(value = "userUuid", required = false) UUID paramUserUuid,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long resolvedId = resolveUserId(headerUserId, headerUserUuid, paramUserId, paramUserUuid, authHeader);
        UserWalletResponse response = rewardsService.getUserWalletDetails(resolvedId);
        return ResponseEntity.ok(ApiResponse.success("Wallet details retrieved successfully", response));
    }

    @GetMapping("/wallet/uuid/{userUuid}")
    public ResponseEntity<ApiResponse<UserWalletResponse>> getWalletByUuid(
            @PathVariable("userUuid") UUID userUuid) {
        User user = userRepository.findByUserUuid(userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for UUID: " + userUuid));
        UserWalletResponse response = rewardsService.getUserWalletDetails(user.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Wallet details retrieved successfully", response));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<CreditTransactionResponse>>> getTransactions(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Uuid", required = false) UUID headerUserUuid,
            @RequestParam(value = "userId", required = false) Long paramUserId,
            @RequestParam(value = "userUuid", required = false) UUID paramUserUuid,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Long resolvedId = resolveUserId(headerUserId, headerUserUuid, paramUserId, paramUserUuid, authHeader);
        Page<CreditTransactionResponse> transactions = rewardsService.getUserTransactions(resolvedId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Transactions retrieved successfully", transactions));
    }

    @GetMapping("/referrals")
    public ResponseEntity<ApiResponse<Page<UserReferralResponse>>> getReferrals(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Uuid", required = false) UUID headerUserUuid,
            @RequestParam(value = "userId", required = false) Long paramUserId,
            @RequestParam(value = "userUuid", required = false) UUID paramUserUuid,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Long resolvedId = resolveUserId(headerUserId, headerUserUuid, paramUserId, paramUserUuid, authHeader);
        Page<UserReferralResponse> referrals = rewardsService.getUserReferrals(resolvedId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Referrals retrieved successfully", referrals));
    }

    @PostMapping("/referrals/apply")
    public ResponseEntity<ApiResponse<UserWalletResponse>> applyReferral(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Uuid", required = false) UUID headerUserUuid,
            @RequestParam(value = "userId", required = false) Long paramUserId,
            @RequestParam(value = "userUuid", required = false) UUID paramUserUuid,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody ApplyReferralRequest request) {
        Long resolvedId = resolveUserId(headerUserId, headerUserUuid, paramUserId, paramUserUuid, authHeader);
        UserWalletResponse response = rewardsService.applyReferralCode(resolvedId, request);
        return ResponseEntity.ok(ApiResponse.success("Referral code applied successfully. Welcome credits awarded!", response));
    }

    @GetMapping("/rules")
    public ResponseEntity<ApiResponse<List<CreditRuleResponse>>> getActiveRules() {
        List<CreditRuleResponse> rules = rewardsService.getActiveCreditRules();
        return ResponseEntity.ok(ApiResponse.success("Active reward rules retrieved successfully", rules));
    }

    // ── REDEMPTIONS FOR TOURNAMENT ORGANIZER SUBSCRIPTION & FREE TOURNAMENTS ─────

    @PostMapping("/redeem/organizer-subscription")
    public ResponseEntity<ApiResponse<CreditRedemptionResponse>> redeemOrganizerSubscription(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Uuid", required = false) UUID headerUserUuid,
            @RequestParam(value = "userId", required = false) Long paramUserId,
            @RequestParam(value = "userUuid", required = false) UUID paramUserUuid,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody RedeemOrganizerSubscriptionRequest request) {
        Long resolvedId = resolveUserId(headerUserId, headerUserUuid, paramUserId, paramUserUuid, authHeader);
        CreditRedemptionResponse response = rewardsService.redeemOrganizerSubscription(resolvedId, request);
        return ResponseEntity.ok(ApiResponse.success("Successfully redeemed credits for Tournament Organizer subscription package!", response));
    }

    @PostMapping("/redeem/free-tournament-host")
    public ResponseEntity<ApiResponse<CreditRedemptionResponse>> redeemFreeTournamentHost(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Uuid", required = false) UUID headerUserUuid,
            @RequestParam(value = "userId", required = false) Long paramUserId,
            @RequestParam(value = "userUuid", required = false) UUID paramUserUuid,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody RedeemFreeTournamentRequest request) {
        Long resolvedId = resolveUserId(headerUserId, headerUserUuid, paramUserId, paramUserUuid, authHeader);
        CreditRedemptionResponse response = rewardsService.redeemFreeTournamentHost(resolvedId, request);
        return ResponseEntity.ok(ApiResponse.success("Successfully redeemed credits to host free tournament!", response));
    }

    // ── TOURNAMENT SERVICE EARNING HOOKS ────────────────────────────────────────

    @PostMapping("/award/tournament-conducted")
    public ResponseEntity<ApiResponse<CreditTransactionResponse>> awardTournamentConducted(
            @Valid @RequestBody AwardTournamentCreditRequest request) {
        CreditTransactionResponse response = rewardsService.awardTournamentConducted(request);
        return ResponseEntity.ok(ApiResponse.success("Organizer tournament credits awarded successfully", response));
    }

    @PostMapping("/award/tournament-participation")
    public ResponseEntity<ApiResponse<CreditTransactionResponse>> awardTournamentParticipation(
            @Valid @RequestBody AwardTournamentCreditRequest request) {
        CreditTransactionResponse response = rewardsService.awardTournamentParticipation(request);
        return ResponseEntity.ok(ApiResponse.success("Player tournament credits awarded successfully", response));
    }

    // ── ADMIN DYNAMIC CONFIGURATION & ADJUSTMENTS ──────────────────────────────

    @GetMapping("/admin/rules")
    public ResponseEntity<ApiResponse<List<CreditRuleResponse>>> getAllRulesAdmin() {
        List<CreditRuleResponse> rules = rewardsService.getAllCreditRulesAdmin();
        return ResponseEntity.ok(ApiResponse.success("All credit rules retrieved successfully", rules));
    }

    @PostMapping("/admin/rules/update")
    public ResponseEntity<ApiResponse<CreditRuleResponse>> updateRule(
            @RequestHeader(value = "X-User-Id", required = false) Long adminUserId,
            @Valid @RequestBody UpdateCreditRuleRequest request) {
        Long adminId = adminUserId != null ? adminUserId : 1L;
        CreditRuleResponse response = rewardsService.updateCreditRule(request, adminId);
        return ResponseEntity.ok(ApiResponse.success("Dynamic credit rule updated successfully", response));
    }

    @PostMapping("/admin/adjust-credits")
    public ResponseEntity<ApiResponse<CreditTransactionResponse>> adminAdjustCredits(
            @RequestHeader(value = "X-User-Id", required = false) Long adminUserId,
            @Valid @RequestBody AdminAdjustCreditRequest request) {
        Long adminId = adminUserId != null ? adminUserId : 1L;
        CreditTransactionResponse response = rewardsService.adminAdjustCredits(request, adminId);
        return ResponseEntity.ok(ApiResponse.success("Credits adjusted successfully by admin", response));
    }
}
