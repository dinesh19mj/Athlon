package com.athlon.identityservice.rewards.service.impl;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.identityservice.exception.BadRequestException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.oganizationsubscription.entity.OrganizationSubscription;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.organizationsubscription.repository.OrganizationSubscriptionRepository;
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
import com.athlon.identityservice.rewards.entity.CreditRedemption;
import com.athlon.identityservice.rewards.entity.CreditRule;
import com.athlon.identityservice.rewards.entity.CreditTransaction;
import com.athlon.identityservice.rewards.entity.UserReferral;
import com.athlon.identityservice.rewards.entity.UserWallet;
import com.athlon.identityservice.rewards.enums.CreditRuleKey;
import com.athlon.identityservice.rewards.enums.CreditSourceType;
import com.athlon.identityservice.rewards.enums.RedemptionStatus;
import com.athlon.identityservice.rewards.enums.RedemptionType;
import com.athlon.identityservice.rewards.enums.ReferralStatus;
import com.athlon.identityservice.rewards.enums.TransactionType;
import com.athlon.identityservice.rewards.repository.CreditRedemptionRepository;
import com.athlon.identityservice.rewards.repository.CreditRuleRepository;
import com.athlon.identityservice.rewards.repository.CreditTransactionRepository;
import com.athlon.identityservice.rewards.repository.UserReferralRepository;
import com.athlon.identityservice.rewards.repository.UserWalletRepository;
import com.athlon.identityservice.rewards.service.RewardsService;
import com.athlon.identityservice.subscription.entity.SubscriptionPackage;
import com.athlon.identityservice.subscription.repository.SubscriptionPackageRepository;
import com.athlon.identityservice.user.entity.User;
import com.athlon.identityservice.user.entity.UserProfile;
import com.athlon.identityservice.user.repository.UserProfileRepository;
import com.athlon.identityservice.user.repository.UserRepository;

@Service
public class RewardsServiceImpl implements RewardsService {

    private static final Logger log = LoggerFactory.getLogger(RewardsServiceImpl.class);
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserWalletRepository userWalletRepository;
    private final CreditRuleRepository creditRuleRepository;
    private final UserReferralRepository userReferralRepository;
    private final CreditTransactionRepository creditTransactionRepository;
    private final CreditRedemptionRepository creditRedemptionRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationSubscriptionRepository organizationSubscriptionRepository;
    private final SubscriptionPackageRepository subscriptionPackageRepository;

    public RewardsServiceImpl(
            UserWalletRepository userWalletRepository,
            CreditRuleRepository creditRuleRepository,
            UserReferralRepository userReferralRepository,
            CreditTransactionRepository creditTransactionRepository,
            CreditRedemptionRepository creditRedemptionRepository,
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            OrganizationRepository organizationRepository,
            OrganizationSubscriptionRepository organizationSubscriptionRepository,
            SubscriptionPackageRepository subscriptionPackageRepository) {
        this.userWalletRepository = userWalletRepository;
        this.creditRuleRepository = creditRuleRepository;
        this.userReferralRepository = userReferralRepository;
        this.creditTransactionRepository = creditTransactionRepository;
        this.creditRedemptionRepository = creditRedemptionRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.organizationRepository = organizationRepository;
        this.organizationSubscriptionRepository = organizationSubscriptionRepository;
        this.subscriptionPackageRepository = subscriptionPackageRepository;
    }

    @Override
    @Transactional
    public UserWallet getOrCreateUserWallet(Long userId) {
        Optional<UserWallet> existing = userWalletRepository.findByUserId(userId);
        if (existing.isPresent()) {
            return existing.get();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        String code = generateUniqueReferralCode(user);
        UserWallet wallet = new UserWallet(user.getUserId(), user.getUserUuid(), code, userId);
        return userWalletRepository.save(wallet);
    }

    @Override
    @Transactional
    public UserWalletResponse getUserWalletDetails(Long userId) {
        UserWallet wallet = userWalletRepository.findByUserId(userId)
                .orElseGet(() -> getOrCreateUserWallet(userId));

        long referralsCount = userReferralRepository.countByReferrerUserId(userId);

        UserWalletResponse resp = new UserWalletResponse();
        resp.setWalletUuid(wallet.getWalletUuid());
        resp.setUserId(wallet.getUserId());
        resp.setUserUuid(wallet.getUserUuid());
        resp.setReferralCode(wallet.getReferralCode());
        resp.setReferralLink("https://athlon.in/register?ref=" + wallet.getReferralCode());
        resp.setBalance(wallet.getBalance());
        resp.setTotalEarned(wallet.getTotalEarned());
        resp.setTotalSpent(wallet.getTotalSpent());
        resp.setTotalReferralsCount((int) referralsCount);
        resp.setUpdatedAt(wallet.getUpdatedAt() != null ? wallet.getUpdatedAt() : wallet.getCreatedAt());
        return resp;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CreditTransactionResponse> getUserTransactions(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<CreditTransaction> txPage = creditTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return txPage.map(this::mapToTransactionResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserReferralResponse> getUserReferrals(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<UserReferral> refPage = userReferralRepository.findByReferrerUserId(userId, pageable);
        return refPage.map(ref -> {
            UserReferralResponse resp = new UserReferralResponse();
            resp.setReferralUuid(ref.getReferralUuid());
            resp.setRefereeUserId(ref.getRefereeUserId());
            resp.setRefereeUserUuid(ref.getRefereeUserUuid());
            resp.setReferralCode(ref.getReferralCode());
            resp.setStatus(ref.getStatus());
            resp.setCreditsAwarded(ref.getReferrerCreditsAwarded());
            resp.setCompletedAt(ref.getCompletedAt());

            Optional<UserProfile> profile = userProfileRepository.findByUserId(ref.getRefereeUserId());
            if (profile.isPresent()) {
                String name = (profile.get().getFirstName() + " " + (profile.get().getLastName() != null ? profile.get().getLastName() : "")).trim();
                resp.setRefereeName(name.isEmpty() ? "Athlon Athlete" : name);
                resp.setRefereePhone(maskPhone(profile.get().getPhone()));
            } else {
                resp.setRefereeName("Athlon Athlete");
                resp.setRefereePhone("******");
            }
            return resp;
        });
    }

    @Override
    @Transactional
    public UserWalletResponse applyReferralCode(Long refereeUserId, ApplyReferralRequest request) {
        String code = request.getReferralCode().trim().toUpperCase();

        UserWallet refereeWallet = getOrCreateUserWallet(refereeUserId);

        if (userReferralRepository.existsByRefereeUserId(refereeUserId)) {
            throw new BadRequestException("A referral code has already been applied for this account");
        }

        UserWallet referrerWallet = userWalletRepository.findByReferralCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or non-existent referral code: " + code));

        if (referrerWallet.getUserId().equals(refereeUserId)) {
            throw new BadRequestException("You cannot use your own referral code");
        }

        // Fetch dynamic credit rules
        int referrerBonus = getRuleAmount(CreditRuleKey.REFERRAL_SIGNUP_REFERRER.name(), 50);
        int refereeBonus = getRuleAmount(CreditRuleKey.REFERRAL_SIGNUP_REFEREE.name(), 25);

        // Credit Referrer
        if (referrerBonus > 0) {
            long refBefore = referrerWallet.getBalance();
            long refAfter = refBefore + referrerBonus;
            referrerWallet.setBalance(refAfter);
            referrerWallet.setTotalEarned(referrerWallet.getTotalEarned() + referrerBonus);
            userWalletRepository.save(referrerWallet);

            CreditTransaction refTx = new CreditTransaction(
                    referrerWallet.getUserId(),
                    referrerWallet.getUserUuid(),
                    referrerWallet.getWalletId(),
                    TransactionType.CREDIT,
                    CreditSourceType.REFERRAL_BONUS,
                    (long) referrerBonus,
                    refBefore,
                    refAfter,
                    refereeUserId.toString(),
                    "Referral bonus for inviting a new athlete to Athlon",
                    refereeUserId
            );
            creditTransactionRepository.save(refTx);
        }

        // Credit Referee
        if (refereeBonus > 0) {
            long refBefore = refereeWallet.getBalance();
            long refAfter = refBefore + refereeBonus;
            refereeWallet.setBalance(refAfter);
            refereeWallet.setTotalEarned(refereeWallet.getTotalEarned() + refereeBonus);
            userWalletRepository.save(refereeWallet);

            CreditTransaction refereeTx = new CreditTransaction(
                    refereeWallet.getUserId(),
                    refereeWallet.getUserUuid(),
                    refereeWallet.getWalletId(),
                    TransactionType.CREDIT,
                    CreditSourceType.REFEREE_WELCOME,
                    (long) refereeBonus,
                    refBefore,
                    refAfter,
                    referrerWallet.getUserId().toString(),
                    "Welcome bonus for joining with referral code: " + code,
                    refereeUserId
            );
            creditTransactionRepository.save(refereeTx);
        }

        // Save Referral Log
        UserReferral referral = new UserReferral(
                referrerWallet.getUserId(),
                referrerWallet.getUserUuid(),
                refereeWallet.getUserId(),
                refereeWallet.getUserUuid(),
                code,
                referrerBonus,
                refereeBonus
        );
        userReferralRepository.save(referral);

        log.info("Applied referral code {} by user {}. Awarded referrer: {}, referee: {}", code, refereeUserId, referrerBonus, refereeBonus);

        return getUserWalletDetails(refereeUserId);
    }

    @Override
    @Transactional
    public CreditTransactionResponse awardTournamentConducted(AwardTournamentCreditRequest request) {
        UserWallet wallet = getOrCreateUserWallet(request.getUserId());

        int awardPoints = getRuleAmount(CreditRuleKey.TOURNAMENT_CONDUCTED_ORGANIZER.name(), 100);
        if (awardPoints <= 0) {
            throw new BadRequestException("Tournament organizer credit award is currently disabled");
        }

        long before = wallet.getBalance();
        long after = before + awardPoints;
        wallet.setBalance(after);
        wallet.setTotalEarned(wallet.getTotalEarned() + awardPoints);
        userWalletRepository.save(wallet);

        String desc = "Organizer reward for conducting tournament: " + (request.getTournamentName() != null ? request.getTournamentName() : request.getTournamentId());
        CreditTransaction tx = new CreditTransaction(
                wallet.getUserId(),
                wallet.getUserUuid(),
                wallet.getWalletId(),
                TransactionType.CREDIT,
                CreditSourceType.TOURNAMENT_ORGANIZED,
                (long) awardPoints,
                before,
                after,
                request.getTournamentId(),
                desc,
                request.getUserId()
        );
        CreditTransaction savedTx = creditTransactionRepository.save(tx);
        log.info("Awarded {} credits to organizer {} for conducting tournament {}", awardPoints, request.getUserId(), request.getTournamentId());
        return mapToTransactionResponse(savedTx);
    }

    @Override
    @Transactional
    public CreditTransactionResponse awardTournamentParticipation(AwardTournamentCreditRequest request) {
        UserWallet wallet = getOrCreateUserWallet(request.getUserId());

        int awardPoints = getRuleAmount(CreditRuleKey.TOURNAMENT_PARTICIPATION_PLAYER.name(), 20);
        if (awardPoints <= 0) {
            throw new BadRequestException("Tournament player participation credit award is currently disabled");
        }

        long before = wallet.getBalance();
        long after = before + awardPoints;
        wallet.setBalance(after);
        wallet.setTotalEarned(wallet.getTotalEarned() + awardPoints);
        userWalletRepository.save(wallet);

        String desc = "Player participation reward in tournament: " + (request.getTournamentName() != null ? request.getTournamentName() : request.getTournamentId());
        CreditTransaction tx = new CreditTransaction(
                wallet.getUserId(),
                wallet.getUserUuid(),
                wallet.getWalletId(),
                TransactionType.CREDIT,
                CreditSourceType.TOURNAMENT_PARTICIPATED,
                (long) awardPoints,
                before,
                after,
                request.getTournamentId(),
                desc,
                request.getUserId()
        );
        CreditTransaction savedTx = creditTransactionRepository.save(tx);
        log.info("Awarded {} credits to player {} for participating in tournament {}", awardPoints, request.getUserId(), request.getTournamentId());
        return mapToTransactionResponse(savedTx);
    }

    @Override
    @Transactional
    public CreditRedemptionResponse redeemOrganizerSubscription(Long userId, RedeemOrganizerSubscriptionRequest request) {
        UserWallet wallet = getOrCreateUserWallet(userId);

        int cost = getRuleAmount(CreditRuleKey.ORGANIZER_SUBSCRIPTION_CREDIT_COST.name(), 500);
        if (wallet.getBalance() < cost) {
            throw new BadRequestException("Insufficient credits balance. You need " + cost + " credits to subscribe to the Tournament Organizer package, but have " + wallet.getBalance() + " credits.");
        }

        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with ID: " + request.getOrganizationId()));

        SubscriptionPackage pack;
        if (request.getPackageId() != null) {
            pack = subscriptionPackageRepository.findById(request.getPackageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subscription Package not found with ID: " + request.getPackageId()));
        } else {
            // Find default organizer package or first active package
            pack = subscriptionPackageRepository.findAll().stream()
                    .filter(p -> p.getIsActive() != null && p.getIsActive() == 1)
                    .findFirst()
                    .orElse(null);
        }

        int durationMonths = (pack != null && pack.getDurationMonths() != null) ? pack.getDurationMonths() : 1;
        Long packageId = (pack != null) ? pack.getPackageId() : 1L;

        // Debit credits from wallet
        long before = wallet.getBalance();
        long after = before - cost;
        wallet.setBalance(after);
        wallet.setTotalSpent(wallet.getTotalSpent() + cost);
        userWalletRepository.save(wallet);

        // Record Credit Transaction
        String desc = "Redeemed " + cost + " credits for Tournament Organizer subscription (Org: " + organization.getName() + ")";
        CreditTransaction tx = new CreditTransaction(
                wallet.getUserId(),
                wallet.getUserUuid(),
                wallet.getWalletId(),
                TransactionType.DEBIT,
                CreditSourceType.ORGANIZER_SUBSCRIPTION_REDEEM,
                (long) cost,
                before,
                after,
                String.valueOf(organization.getOrganizationId()),
                desc,
                userId
        );
        creditTransactionRepository.save(tx);

        // Activate or extend Organization Subscription
        organizationSubscriptionRepository.findByOrganizationIdAndStatus(organization.getOrganizationId(), "ACTIVE")
                .ifPresent(sub -> {
                    sub.setStatus("EXPIRED");
                    organizationSubscriptionRepository.save(sub);
                });

        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = startDate.plusMonths(durationMonths);

        OrganizationSubscription subscription = new OrganizationSubscription(
                organization.getOrganizationId(),
                packageId,
                startDate,
                endDate,
                "CREDIT_REDEMPTION_" + cost + "_PTS"
        );
        organizationSubscriptionRepository.save(subscription);

        // Save Credit Redemption record
        CreditRedemption redemption = new CreditRedemption(
                userId,
                wallet.getUserUuid(),
                RedemptionType.ORGANIZER_SUBSCRIPTION,
                cost,
                String.valueOf(organization.getOrganizationId())
        );
        CreditRedemption savedRedemption = creditRedemptionRepository.save(redemption);

        log.info("User {} redeemed {} credits for Tournament Organizer subscription on Organization {}", userId, cost, organization.getOrganizationId());

        CreditRedemptionResponse resp = new CreditRedemptionResponse();
        resp.setRedemptionUuid(savedRedemption.getRedemptionUuid());
        resp.setUserId(userId);
        resp.setUserUuid(wallet.getUserUuid());
        resp.setRedemptionType(savedRedemption.getRedemptionType());
        resp.setCreditsSpent(cost);
        resp.setTargetId(savedRedemption.getTargetId());
        resp.setStatus(savedRedemption.getStatus());
        resp.setRemainingBalance(after);
        resp.setCreatedAt(savedRedemption.getCreatedAt());
        return resp;
    }

    @Override
    @Transactional
    public CreditRedemptionResponse redeemFreeTournamentHost(Long userId, RedeemFreeTournamentRequest request) {
        UserWallet wallet = getOrCreateUserWallet(userId);

        int cost = getRuleAmount(CreditRuleKey.ORGANIZER_FREE_TOURNAMENT_COST.name(), 300);
        if (wallet.getBalance() < cost) {
            throw new BadRequestException("Insufficient credits balance. You need " + cost + " credits to host an individual free tournament, but have " + wallet.getBalance() + " credits.");
        }

        long before = wallet.getBalance();
        long after = before - cost;
        wallet.setBalance(after);
        wallet.setTotalSpent(wallet.getTotalSpent() + cost);
        userWalletRepository.save(wallet);

        String desc = "Redeemed " + cost + " credits to host free tournament: " + (request.getTargetName() != null ? request.getTargetName() : request.getTargetId());
        CreditTransaction tx = new CreditTransaction(
                wallet.getUserId(),
                wallet.getUserUuid(),
                wallet.getWalletId(),
                TransactionType.DEBIT,
                CreditSourceType.FREE_TOURNAMENT_HOST_REDEEM,
                (long) cost,
                before,
                after,
                request.getTargetId(),
                desc,
                userId
        );
        creditTransactionRepository.save(tx);

        CreditRedemption redemption = new CreditRedemption(
                userId,
                wallet.getUserUuid(),
                RedemptionType.FREE_TOURNAMENT_HOST,
                cost,
                request.getTargetId()
        );
        CreditRedemption savedRedemption = creditRedemptionRepository.save(redemption);

        log.info("Organizer {} redeemed {} credits to host free tournament {}", userId, cost, request.getTargetId());

        CreditRedemptionResponse resp = new CreditRedemptionResponse();
        resp.setRedemptionUuid(savedRedemption.getRedemptionUuid());
        resp.setUserId(userId);
        resp.setUserUuid(wallet.getUserUuid());
        resp.setRedemptionType(savedRedemption.getRedemptionType());
        resp.setCreditsSpent(cost);
        resp.setTargetId(savedRedemption.getTargetId());
        resp.setStatus(savedRedemption.getStatus());
        resp.setRemainingBalance(after);
        resp.setCreatedAt(savedRedemption.getCreatedAt());
        return resp;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CreditRuleResponse> getActiveCreditRules() {
        return creditRuleRepository.findByIsActive(1).stream()
                .map(this::mapToRuleResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CreditRuleResponse> getAllCreditRulesAdmin() {
        return creditRuleRepository.findAll().stream()
                .map(this::mapToRuleResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CreditRuleResponse updateCreditRule(UpdateCreditRuleRequest request, Long adminUserId) {
        CreditRule rule = creditRuleRepository.findByRuleKey(request.getRuleKey())
                .orElseThrow(() -> new ResourceNotFoundException("Credit rule not found with key: " + request.getRuleKey()));

        if (request.getCreditAmount() != null) {
            rule.setCreditAmount(request.getCreditAmount());
        }
        if (request.getMinThreshold() != null) {
            rule.setMinThreshold(request.getMinThreshold());
        }
        if (request.getRuleName() != null && !request.getRuleName().isBlank()) {
            rule.setRuleName(request.getRuleName());
        }
        if (request.getDescription() != null) {
            rule.setDescription(request.getDescription());
        }
        if (request.getIsActive() != null) {
            rule.setIsActive(request.getIsActive());
        }
        rule.setUpdatedBy(adminUserId);

        CreditRule savedRule = creditRuleRepository.save(rule);
        log.info("Admin {} updated dynamic credit rule {}", adminUserId, rule.getRuleKey());
        return mapToRuleResponse(savedRule);
    }

    @Override
    @Transactional
    public CreditTransactionResponse adminAdjustCredits(AdminAdjustCreditRequest request, Long adminUserId) {
        UserWallet wallet = getOrCreateUserWallet(request.getUserId());

        long before = wallet.getBalance();
        long after;
        if (request.getTransactionType() == TransactionType.CREDIT) {
            after = before + request.getAmount();
            wallet.setTotalEarned(wallet.getTotalEarned() + request.getAmount());
        } else {
            if (before < request.getAmount()) {
                throw new BadRequestException("Cannot deduct " + request.getAmount() + " credits. User balance is only " + before);
            }
            after = before - request.getAmount();
            wallet.setTotalSpent(wallet.getTotalSpent() + request.getAmount());
        }
        wallet.setBalance(after);
        userWalletRepository.save(wallet);

        CreditTransaction tx = new CreditTransaction(
                wallet.getUserId(),
                wallet.getUserUuid(),
                wallet.getWalletId(),
                request.getTransactionType(),
                CreditSourceType.ADMIN_ADJUSTMENT,
                request.getAmount(),
                before,
                after,
                "ADMIN-" + adminUserId,
                "Admin adjustment: " + request.getReason(),
                adminUserId
        );
        CreditTransaction savedTx = creditTransactionRepository.save(tx);
        log.info("Admin {} performed {} of {} credits for user {}", adminUserId, request.getTransactionType(), request.getAmount(), request.getUserId());
        return mapToTransactionResponse(savedTx);
    }

    private int getRuleAmount(String key, int defaultValue) {
        return creditRuleRepository.findByRuleKey(key)
                .filter(r -> r.getIsActive() != null && r.getIsActive() == 1)
                .map(CreditRule::getCreditAmount)
                .orElse(defaultValue);
    }

    private String generateUniqueReferralCode(User user) {
        String base = "ATH";
        for (int attempt = 0; attempt < 100; attempt++) {
            StringBuilder sb = new StringBuilder(base);
            for (int i = 0; i < 6; i++) {
                sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            }
            String candidate = sb.toString();
            if (!userWalletRepository.existsByReferralCode(candidate)) {
                return candidate;
            }
        }
        return "ATH" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return "******";
        return phone.substring(0, 2) + "******" + phone.substring(phone.length() - 2);
    }

    private CreditTransactionResponse mapToTransactionResponse(CreditTransaction tx) {
        CreditTransactionResponse resp = new CreditTransactionResponse();
        resp.setTransactionUuid(tx.getTransactionUuid());
        resp.setTransactionType(tx.getTransactionType());
        resp.setSourceType(tx.getSourceType());
        resp.setAmount(tx.getAmount());
        resp.setBalanceBefore(tx.getBalanceBefore());
        resp.setBalanceAfter(tx.getBalanceAfter());
        resp.setReferenceId(tx.getReferenceId());
        resp.setDescription(tx.getDescription());
        resp.setCreatedAt(tx.getCreatedAt());
        return resp;
    }

    private CreditRuleResponse mapToRuleResponse(CreditRule rule) {
        CreditRuleResponse resp = new CreditRuleResponse();
        resp.setRuleUuid(rule.getRuleUuid());
        resp.setRuleKey(rule.getRuleKey());
        resp.setRuleName(rule.getRuleName());
        resp.setCategory(rule.getCategory());
        resp.setCreditAmount(rule.getCreditAmount());
        resp.setMinThreshold(rule.getMinThreshold());
        resp.setDescription(rule.getDescription());
        resp.setIsActive(rule.getIsActive());
        resp.setUpdatedAt(rule.getUpdatedAt() != null ? rule.getUpdatedAt() : rule.getCreatedAt());
        return resp;
    }
}
