package com.athlon.identityservice.rewards.service;

import java.util.List;

import org.springframework.data.domain.Page;

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
import com.athlon.identityservice.rewards.entity.UserWallet;

public interface RewardsService {

    UserWallet getOrCreateUserWallet(Long userId);

    UserWalletResponse getUserWalletDetails(Long userId);

    Page<CreditTransactionResponse> getUserTransactions(Long userId, int page, int size);

    Page<UserReferralResponse> getUserReferrals(Long userId, int page, int size);

    UserWalletResponse applyReferralCode(Long refereeUserId, ApplyReferralRequest request);

    CreditTransactionResponse awardTournamentConducted(AwardTournamentCreditRequest request);

    CreditTransactionResponse awardTournamentParticipation(AwardTournamentCreditRequest request);

    CreditRedemptionResponse redeemOrganizerSubscription(Long userId, RedeemOrganizerSubscriptionRequest request);

    CreditRedemptionResponse redeemFreeTournamentHost(Long userId, RedeemFreeTournamentRequest request);

    List<CreditRuleResponse> getActiveCreditRules();

    List<CreditRuleResponse> getAllCreditRulesAdmin();

    CreditRuleResponse updateCreditRule(UpdateCreditRuleRequest request, Long adminUserId);

    CreditTransactionResponse adminAdjustCredits(AdminAdjustCreditRequest request, Long adminUserId);
}
