package com.athlon.identityservice.subscription.service;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.exception.SubscriptionEntitlementException;
import com.athlon.identityservice.oganizationsubscription.entity.OrganizationSubscription;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.organizationsubscription.repository.OrganizationSubscriptionRepository;
import com.athlon.identityservice.subscription.dto.OrganizerCreditWalletDto;
import com.athlon.identityservice.subscription.dto.TournamentSubscriptionPlanDto;
import com.athlon.identityservice.subscription.dto.request.ConsumeAuctionCreditRequest;
import com.athlon.identityservice.subscription.dto.request.ConsumeTournamentCreditRequest;
import com.athlon.identityservice.subscription.dto.request.RefundTournamentCreditRequest;
import com.athlon.identityservice.subscription.dto.request.TopupCreditRequest;
import com.athlon.identityservice.subscription.dto.response.TournamentCreditTransactionDto;
import com.athlon.identityservice.subscription.entity.*;
import com.athlon.identityservice.subscription.repository.*;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TournamentEntitlementService {

    private static final Logger log = LoggerFactory.getLogger(TournamentEntitlementService.class);

    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionPlanVersionRepository versionRepository;
    private final SubscriptionPlanPriceRepository priceRepository;
    private final SubscriptionPlanLimitRepository limitRepository;
    private final SubscriptionPlanFeatureRepository featureRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationSubscriptionRepository orgSubRepository;

    private final OrganizationCreditAccountRepository accountRepository;
    private final OrganizationCreditGrantRepository grantRepository;
    private final OrganizationCreditTransactionRepository transactionRepository;
    private final TournamentCreditAllocationRepository allocationRepository;
    private final AuctionCreditActivationRepository activationRepository;

    public TournamentEntitlementService(
            SubscriptionPlanRepository planRepository,
            SubscriptionPlanVersionRepository versionRepository,
            SubscriptionPlanPriceRepository priceRepository,
            SubscriptionPlanLimitRepository limitRepository,
            SubscriptionPlanFeatureRepository featureRepository,
            OrganizationRepository organizationRepository,
            OrganizationSubscriptionRepository orgSubRepository,
            OrganizationCreditAccountRepository accountRepository,
            OrganizationCreditGrantRepository grantRepository,
            OrganizationCreditTransactionRepository transactionRepository,
            TournamentCreditAllocationRepository allocationRepository,
            AuctionCreditActivationRepository activationRepository
    ) {
        this.planRepository = planRepository;
        this.versionRepository = versionRepository;
        this.priceRepository = priceRepository;
        this.limitRepository = limitRepository;
        this.featureRepository = featureRepository;
        this.organizationRepository = organizationRepository;
        this.orgSubRepository = orgSubRepository;
        this.accountRepository = accountRepository;
        this.grantRepository = grantRepository;
        this.transactionRepository = transactionRepository;
        this.allocationRepository = allocationRepository;
        this.activationRepository = activationRepository;
    }

    @PostConstruct
    @Transactional
    public void init() {
        seedDefaultTournamentPlans();
    }

    @Transactional
    public void seedDefaultTournamentPlans() {
        if (planRepository.findByPlanCode("TOURNAMENT_STARTER").isPresent()) {
            return;
        }

        log.info("Seeding Default Tournament Organizer Subscription Plans...");

        // 1. FREE PLAN
        createTournamentPlanHierarchy(
                "TOURNAMENT_FREE",
                "Tournament Free",
                "Grassroots tournament creation with 1 free trial event and up to 32 players",
                0,
                BigDecimal.ZERO,
                1, // 1 trial credit
                0, // 0 auction credits
                30, // 30 days validity
                Map.of(
                        "MAX_PARTICIPANTS", 32,
                        "MAX_CATEGORIES", 2,
                        "MAX_OFFICIALS", 2,
                        "MAX_COURTS", 2,
                        "AUCTION_ALLOWED", 0
                ),
                Set.of(
                        "BASIC_SETUP",
                        "BASIC_REGISTRATION",
                        "MANUAL_REGISTRATION",
                        "BASIC_SINGLE_KNOCKOUT",
                        "BASIC_ROUND_ROBIN",
                        "BASIC_UMPIRE_SCORING",
                        "PUBLIC_RESULTS",
                        "BASIC_CERTIFICATES",
                        "BASIC_REVENUE_SUMMARY"
                )
        );

        // 2. STARTER PLAN
        createTournamentPlanHierarchy(
                "TOURNAMENT_STARTER",
                "Tournament Starter",
                "Single tournament pass with online payments, doubles linking, and live scoring for club events",
                1,
                BigDecimal.valueOf(499),
                1,
                0,
                365,
                Map.of(
                        "MAX_PARTICIPANTS", 128,
                        "MAX_CATEGORIES", 8,
                        "MAX_OFFICIALS", 5,
                        "MAX_COURTS", 5,
                        "AUCTION_ALLOWED", 0
                ),
                Set.of(
                        "BASIC_SETUP",
                        "ONLINE_REGISTRATION",
                        "PAYMENT_VERIFICATION",
                        "DOUBLES_PARTNER_LINKING",
                        "KNOCKOUT_AND_LEAGUE_DRAWS",
                        "POOLED_KNOCKOUT",
                        "BASIC_AUTO_SCHEDULING",
                        "LIVE_SCORING",
                        "BASIC_OBS_OVERLAYS",
                        "BASIC_FINANCIAL_REPORTING",
                        "TOURNAMENT_CERTIFICATES",
                        "SPONSOR_PLACEMENTS"
                )
        );

        // 3. PROFESSIONAL PLAN
        createTournamentPlanHierarchy(
                "TOURNAMENT_PRO",
                "Tournament Professional",
                "5 tournament pack with advanced draw seeding, OBS broadcast overlays, team championships, and live auction eligibility",
                2,
                BigDecimal.valueOf(1999),
                5,
                0,
                365,
                Map.of(
                        "MAX_PARTICIPANTS", 512,
                        "MAX_CATEGORIES", 30,
                        "MAX_OFFICIALS", 20,
                        "MAX_COURTS", 20,
                        "AUCTION_ALLOWED", 1
                ),
                Set.of(
                        "BASIC_SETUP",
                        "ONLINE_REGISTRATION",
                        "PAYMENT_VERIFICATION",
                        "DOUBLES_PARTNER_LINKING",
                        "KNOCKOUT_AND_LEAGUE_DRAWS",
                        "POOLED_KNOCKOUT",
                        "ADVANCED_DRAWS",
                        "ADVANCED_SCHEDULING",
                        "REST_INTERVAL_ENFORCEMENT",
                        "ADVANCED_SEEDING",
                        "LIVE_SCORING",
                        "ADVANCED_BROADCAST_OVERLAYS",
                        "SPONSOR_ROTATION",
                        "ADVANCED_FINANCIAL_REPORTING",
                        "TOURNAMENT_INVENTORY",
                        "ADVANCED_PERMISSIONS",
                        "TEAM_CHAMPIONSHIP",
                        "AUCTION_PLAYER_REGISTRATION",
                        "FULL_AUCTION",
                        "PARTIAL_AUCTION",
                        "NO_AUCTION",
                        "FRANCHISE_SQUAD_MANAGEMENT",
                        "LIVE_AUCTION_ELIGIBLE",
                        "TIE_RUBBER_SCORING"
                )
        );

        // 4. BUSINESS PLAN
        createTournamentPlanHierarchy(
                "TOURNAMENT_BUSINESS",
                "Tournament Business",
                "15 tournament pack with 2 free included live auction activations, complete organizer ERP, inventory, and staff payroll",
                3,
                BigDecimal.valueOf(4999),
                15,
                2, // 2 included auction credits
                365,
                Map.of(
                        "MAX_PARTICIPANTS", 1500,
                        "MAX_CATEGORIES", 75,
                        "MAX_OFFICIALS", 60,
                        "MAX_COURTS", 60,
                        "AUCTION_ALLOWED", 1
                ),
                Set.of(
                        "BASIC_SETUP",
                        "ONLINE_REGISTRATION",
                        "PAYMENT_VERIFICATION",
                        "DOUBLES_PARTNER_LINKING",
                        "KNOCKOUT_AND_LEAGUE_DRAWS",
                        "POOLED_KNOCKOUT",
                        "ADVANCED_DRAWS",
                        "ADVANCED_SCHEDULING",
                        "REST_INTERVAL_ENFORCEMENT",
                        "ADVANCED_SEEDING",
                        "LIVE_SCORING",
                        "ADVANCED_BROADCAST_OVERLAYS",
                        "SPONSOR_ROTATION",
                        "ADVANCED_FINANCIAL_REPORTING",
                        "TOURNAMENT_INVENTORY",
                        "ADVANCED_PERMISSIONS",
                        "TEAM_CHAMPIONSHIP",
                        "AUCTION_PLAYER_REGISTRATION",
                        "FULL_AUCTION",
                        "PARTIAL_AUCTION",
                        "NO_AUCTION",
                        "FRANCHISE_SQUAD_MANAGEMENT",
                        "LIVE_AUCTION_ELIGIBLE",
                        "TIE_RUBBER_SCORING",
                        "ADVANCED_ORGANIZER_ERP",
                        "INVENTORY_STOCK_MOVEMENT",
                        "OFFICIALS_STAFF_PAYROLL",
                        "CROSS_VENUE_COORDINATION",
                        "CUSTOM_DOMAIN_PORTAL",
                        "DEDICATED_SUPPORT"
                )
        );

        log.info("Tournament Organizer Plans seeded successfully.");
    }

    private void createTournamentPlanHierarchy(
            String planCode,
            String name,
            String description,
            int displayOrder,
            BigDecimal packagePrice,
            int tournamentCredits,
            int includedAuctionCredits,
            int validityDays,
            Map<String, Integer> limits,
            Set<String> features
    ) {
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setPlanCode(planCode);
        plan.setName(name);
        plan.setDescription(description);
        plan.setTargetModule("TOURNAMENT");
        plan.setDisplayOrder(displayOrder);
        plan.setIsActive(1);
        plan = planRepository.save(plan);

        SubscriptionPlanVersion version = new SubscriptionPlanVersion();
        version.setPlanId(plan.getPlanId());
        version.setVersionNumber(1);
        version.setIsPublished(true);
        version.setMarketplaceCommissionRate(BigDecimal.ZERO);
        version = versionRepository.save(version);

        // Store package price under ONETIME cycle
        SubscriptionPlanPrice price = new SubscriptionPlanPrice(version.getVersionId(), "ONETIME", packagePrice, "INR");
        priceRepository.save(price);

        // Save limits (including credit metadata)
        Map<String, Integer> allLimits = new HashMap<>(limits);
        allLimits.put("TOURNAMENT_CREDITS", tournamentCredits);
        allLimits.put("INCLUDED_AUCTION_CREDITS", includedAuctionCredits);
        allLimits.put("VALIDITY_DAYS", validityDays);

        for (Map.Entry<String, Integer> entry : allLimits.entrySet()) {
            SubscriptionPlanLimit limit = new SubscriptionPlanLimit(version.getVersionId(), entry.getKey(), entry.getValue());
            limitRepository.save(limit);
        }

        // Save features
        for (String featCode : features) {
            SubscriptionPlanFeature feat = new SubscriptionPlanFeature(version.getVersionId(), featCode, true);
            featureRepository.save(feat);
        }
    }

    @Transactional(readOnly = true)
    public List<TournamentSubscriptionPlanDto> getAllTournamentPlans() {
        List<SubscriptionPlan> plans = planRepository.findByTargetModuleOrderByDisplayOrderAsc("TOURNAMENT");
        return plans.stream()
                .filter(p -> p.getIsActive() != null && p.getIsActive() == 1)
                .map(this::mapToTournamentPlanDto)
                .collect(Collectors.toList());
    }

    private TournamentSubscriptionPlanDto mapToTournamentPlanDto(SubscriptionPlan plan) {
        TournamentSubscriptionPlanDto dto = new TournamentSubscriptionPlanDto();
        dto.setPlanId(plan.getPlanId());
        dto.setPlanUuid(plan.getPlanUuid());
        dto.setPlanCode(plan.getPlanCode());
        dto.setName(plan.getName());
        dto.setDescription(plan.getDescription());
        dto.setDisplayOrder(plan.getDisplayOrder());

        Optional<SubscriptionPlanVersion> versionOpt = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(
                plan.getPlanId()
        );

        if (versionOpt.isPresent()) {
            SubscriptionPlanVersion version = versionOpt.get();
            dto.setVersionId(version.getVersionId());
            dto.setVersionNumber(version.getVersionNumber());

            List<SubscriptionPlanPrice> prices = priceRepository.findByVersionId(version.getVersionId());
            prices.stream()
                    .filter(p -> "ONETIME".equalsIgnoreCase(p.getBillingCycle())
                            || "PACKAGE".equalsIgnoreCase(p.getBillingCycle())
                            || "MONTHLY".equalsIgnoreCase(p.getBillingCycle()))
                    .findFirst()
                    .ifPresent(p -> dto.setPackagePrice(p.getAmount()));

            List<SubscriptionPlanLimit> limits = limitRepository.findByVersionId(version.getVersionId());
            Map<String, Integer> limitMap = new HashMap<>();
            limits.forEach(l -> limitMap.put(l.getLimitCode(), l.getLimitValue()));
            dto.setLimits(limitMap);

            dto.setTournamentCredits(limitMap.getOrDefault("TOURNAMENT_CREDITS", limitMap.getOrDefault("TOURNAMENT_CREDIT", 1)));
            dto.setIncludedAuctionCredits(limitMap.getOrDefault("INCLUDED_AUCTION_CREDITS", 0));
            dto.setValidityDays(limitMap.getOrDefault("VALIDITY_DAYS", 365));

            List<SubscriptionPlanFeature> features = featureRepository.findByVersionId(version.getVersionId());
            Map<String, Boolean> featMap = new HashMap<>();
            features.forEach(f -> featMap.put(f.getFeatureCode(), f.getIsEnabled() != null && f.getIsEnabled()));
            dto.setFeatures(featMap);
        }

        return dto;
    }

    @Transactional
    public OrganizationCreditAccount getOrCreateCreditAccount(Long organizationId) {
        return accountRepository.findByOrganizationId(organizationId).orElseGet(() -> {
            // Dynamically check if the organization already has an active subscription in organization_subscriptions
            Optional<OrganizationSubscription> activeSubOpt = orgSubRepository.findByOrganizationIdAndStatus(organizationId, "ACTIVE");
            SubscriptionPlan resolvedPlan = null;
            SubscriptionPlanVersion resolvedVersion = null;

            if (activeSubOpt.isPresent() && activeSubOpt.get().getPackageId() != null) {
                resolvedPlan = planRepository.findById(activeSubOpt.get().getPackageId()).orElse(null);
                if (resolvedPlan != null && !"TOURNAMENT".equalsIgnoreCase(resolvedPlan.getTargetModule())
                        && !"ORGANIZER".equalsIgnoreCase(resolvedPlan.getTargetModule())) {
                    resolvedPlan = null;
                }
                if (resolvedPlan != null) {
                    if (activeSubOpt.get().getVersionId() != null) {
                        resolvedVersion = versionRepository.findById(activeSubOpt.get().getVersionId()).orElse(null);
                    }
                    if (resolvedVersion == null) {
                        resolvedVersion = versionRepository
                                .findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(resolvedPlan.getPlanId())
                                .orElse(null);
                    }
                }
            }

            if (resolvedPlan == null) {
                resolvedPlan = planRepository.findByPlanCode("TOURNAMENT_FREE")
                        .orElseGet(() -> {
                            List<SubscriptionPlan> tPlans = planRepository.findByTargetModuleOrderByDisplayOrderAsc("TOURNAMENT");
                            return tPlans.isEmpty() ? null : tPlans.get(0);
                        });
                if (resolvedPlan != null) {
                    resolvedVersion = versionRepository
                            .findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(resolvedPlan.getPlanId())
                            .orElse(null);
                }
            }

            String tierCode = resolvedPlan != null ? resolvedPlan.getPlanCode() : "TOURNAMENT_FREE";
            int tournamentCredits = 1;
            int includedAuctionCredits = 0;
            int validityDays = "TOURNAMENT_FREE".equalsIgnoreCase(tierCode) ? 30 : 365;

            if (resolvedVersion != null) {
                List<SubscriptionPlanLimit> limits = limitRepository.findByVersionId(resolvedVersion.getVersionId());
                Map<String, Integer> limitMap = new HashMap<>();
                limits.forEach(l -> limitMap.put(l.getLimitCode(), l.getLimitValue()));
                tournamentCredits = limitMap.getOrDefault("TOURNAMENT_CREDITS", limitMap.getOrDefault("TOURNAMENT_CREDIT", 1));
                includedAuctionCredits = limitMap.getOrDefault("INCLUDED_AUCTION_CREDITS", 0);
                validityDays = limitMap.getOrDefault("VALIDITY_DAYS", validityDays);
            }

            OrganizationCreditAccount newAccount = new OrganizationCreditAccount(organizationId, tierCode);
            newAccount.setTournamentCreditsAvailable(tournamentCredits);
            newAccount.setAuctionCreditsAvailable(includedAuctionCredits);
            newAccount = accountRepository.save(newAccount);

            String sourceType = "TOURNAMENT_FREE".equalsIgnoreCase(tierCode) ? "SYSTEM_TRIAL" : "PACKAGE_PURCHASE";

            // Grant tournament credits dynamically from plan limits
            OrganizationCreditGrant tournamentGrant = new OrganizationCreditGrant(
                    newAccount.getAccountId(),
                    "TOURNAMENT_CREDIT",
                    tournamentCredits,
                    sourceType,
                    LocalDateTime.now().plusDays(validityDays)
            );
            grantRepository.save(tournamentGrant);

            OrganizationCreditTransaction tx = new OrganizationCreditTransaction(
                    newAccount.getAccountId(),
                    "TOURNAMENT_CREDIT",
                    tournamentCredits,
                    "GRANT",
                    sourceType,
                    tierCode,
                    "GRANT_INIT_ORG_" + organizationId + "_" + tierCode,
                    "Initial " + (resolvedPlan != null ? resolvedPlan.getName() : tierCode) + " Tournament Credits (" + validityDays + " days validity)"
            );
            transactionRepository.save(tx);

            // Grant included auction credits if configured on plan
            if (includedAuctionCredits > 0) {
                OrganizationCreditGrant auctionGrant = new OrganizationCreditGrant(
                        newAccount.getAccountId(),
                        "AUCTION_ACTIVATION_CREDIT",
                        includedAuctionCredits,
                        sourceType,
                        LocalDateTime.now().plusDays(validityDays)
                );
                grantRepository.save(auctionGrant);

                OrganizationCreditTransaction auctionTx = new OrganizationCreditTransaction(
                        newAccount.getAccountId(),
                        "AUCTION_ACTIVATION_CREDIT",
                        includedAuctionCredits,
                        "GRANT",
                        sourceType,
                        tierCode,
                        "GRANT_INIT_AUCTION_ORG_" + organizationId + "_" + tierCode,
                        "Included Live Auction Credits with " + (resolvedPlan != null ? resolvedPlan.getName() : tierCode)
                );
                transactionRepository.save(auctionTx);
            }

            return newAccount;
        });
    }

    /**
     * Synchronizes OrganizationCreditAccount when an organization subscribes to or upgrades a Tournament plan
     * via OrganizationService.createOrganization() or SubscriptionService.subscribeOrganization().
     */
    @Transactional
    public OrganizationCreditAccount syncCreditAccountWithPlan(
            Long organizationId,
            SubscriptionPlan plan,
            SubscriptionPlanVersion version,
            String reference
    ) {
        if (plan == null) {
            return getOrCreateCreditAccount(organizationId);
        }

        Optional<OrganizationCreditAccount> existingOpt = accountRepository.findByOrganizationId(organizationId);
        if (existingOpt.isEmpty()) {
            return getOrCreateCreditAccount(organizationId);
        }

        OrganizationCreditAccount account = existingOpt.get();
        String newPlanCode = plan.getPlanCode();

        // If already on the exact same plan and initialized, return
        if (newPlanCode != null && newPlanCode.equalsIgnoreCase(account.getActiveTierCode())) {
            return account;
        }

        SubscriptionPlanVersion targetVersion = version;
        if (targetVersion == null) {
            targetVersion = versionRepository
                    .findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(plan.getPlanId())
                    .orElse(null);
        }

        int tournamentCredits = 1;
        int includedAuctionCredits = 0;
        int validityDays = "TOURNAMENT_FREE".equalsIgnoreCase(newPlanCode) ? 30 : 365;

        if (targetVersion != null) {
            List<SubscriptionPlanLimit> limits = limitRepository.findByVersionId(targetVersion.getVersionId());
            Map<String, Integer> limitMap = new HashMap<>();
            limits.forEach(l -> limitMap.put(l.getLimitCode(), l.getLimitValue()));
            tournamentCredits = limitMap.getOrDefault("TOURNAMENT_CREDITS", limitMap.getOrDefault("TOURNAMENT_CREDIT", 1));
            includedAuctionCredits = limitMap.getOrDefault("INCLUDED_AUCTION_CREDITS", 0);
            validityDays = limitMap.getOrDefault("VALIDITY_DAYS", validityDays);
        }

        String oldTierCode = account.getActiveTierCode();
        account.setActiveTierCode(newPlanCode);

        // If upgrading from TOURNAMENT_FREE or activating a new package subscription, grant the package credits
        if (!"TOURNAMENT_FREE".equalsIgnoreCase(newPlanCode)) {
            // If previous tier was TOURNAMENT_FREE with 1 unused trial credit, replace trial credit with package credits; otherwise add package credits
            if ("TOURNAMENT_FREE".equalsIgnoreCase(oldTierCode) && account.getTournamentCreditsAvailable() <= 1) {
                account.setTournamentCreditsAvailable(tournamentCredits);
            } else {
                account.setTournamentCreditsAvailable(account.getTournamentCreditsAvailable() + tournamentCredits);
            }

            if (includedAuctionCredits > 0) {
                account.setAuctionCreditsAvailable(account.getAuctionCreditsAvailable() + includedAuctionCredits);
            }

            account = accountRepository.save(account);

            LocalDateTime expiresAt = LocalDateTime.now().plusDays(validityDays);
            OrganizationCreditGrant grant = new OrganizationCreditGrant(
                    account.getAccountId(),
                    "TOURNAMENT_CREDIT",
                    tournamentCredits,
                    "PACKAGE_PURCHASE",
                    expiresAt
            );
            grantRepository.save(grant);

            OrganizationCreditTransaction tx = new OrganizationCreditTransaction(
                    account.getAccountId(),
                    "TOURNAMENT_CREDIT",
                    tournamentCredits,
                    "GRANT",
                    "PACKAGE_PURCHASE",
                    reference != null ? reference : newPlanCode,
                    "SYNC_PLAN_" + organizationId + "_" + newPlanCode + "_" + UUID.randomUUID(),
                    "Activated " + plan.getName() + " (" + tournamentCredits + " Tournament Credits)"
            );
            transactionRepository.save(tx);

            if (includedAuctionCredits > 0) {
                OrganizationCreditGrant auctionGrant = new OrganizationCreditGrant(
                        account.getAccountId(),
                        "AUCTION_ACTIVATION_CREDIT",
                        includedAuctionCredits,
                        "PACKAGE_PURCHASE",
                        expiresAt
                );
                grantRepository.save(auctionGrant);

                OrganizationCreditTransaction auctionTx = new OrganizationCreditTransaction(
                        account.getAccountId(),
                        "AUCTION_ACTIVATION_CREDIT",
                        includedAuctionCredits,
                        "GRANT",
                        "PACKAGE_PURCHASE",
                        reference != null ? reference : newPlanCode,
                        "SYNC_AUCTION_" + organizationId + "_" + newPlanCode + "_" + UUID.randomUUID(),
                        "Included Live Auction Credits with " + plan.getName()
                );
                transactionRepository.save(auctionTx);
            }
        } else {
            account = accountRepository.save(account);
        }

        return account;
    }

    @Transactional
    public OrganizerCreditWalletDto getWalletByOrgUuid(UUID orgUuid) {
        Organization org = organizationRepository.findByOrganizationUuid(orgUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + orgUuid));
        return getWalletByOrgId(org.getOrganizationId());
    }

    @Transactional
    public OrganizerCreditWalletDto getWalletByOrgId(Long orgId) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + orgId));

        boolean isReadOnly = org.springframework.transaction.support.TransactionSynchronizationManager.isCurrentTransactionReadOnly();
        OrganizationCreditAccount account;

        if (isReadOnly) {
            account = accountRepository.findByOrganizationId(orgId)
                    .orElseGet(() -> buildTransientDefaultAccount(orgId));
        } else {
            account = getOrCreateCreditAccount(orgId);

            // Self-healing sync: if organization_subscriptions has an ACTIVE tournament plan while account is still on TOURNAMENT_FREE, sync it automatically
            Optional<OrganizationSubscription> activeSubOpt = orgSubRepository.findByOrganizationIdAndStatus(orgId, "ACTIVE");
            if (activeSubOpt.isPresent() && activeSubOpt.get().getPackageId() != null) {
                SubscriptionPlan subPlan = planRepository.findById(activeSubOpt.get().getPackageId()).orElse(null);
                if (subPlan != null
                        && ("TOURNAMENT".equalsIgnoreCase(subPlan.getTargetModule()) || "ORGANIZER".equalsIgnoreCase(subPlan.getTargetModule()))
                        && !subPlan.getPlanCode().equalsIgnoreCase(account.getActiveTierCode())
                        && "TOURNAMENT_FREE".equalsIgnoreCase(account.getActiveTierCode())) {
                    SubscriptionPlanVersion subVer = activeSubOpt.get().getVersionId() != null
                            ? versionRepository.findById(activeSubOpt.get().getVersionId()).orElse(null)
                            : null;
                    account = syncCreditAccountWithPlan(orgId, subPlan, subVer, "AUTO_SYNC_SUBSCRIPTION");
                }
            }
        }

        OrganizerCreditWalletDto dto = new OrganizerCreditWalletDto();
        dto.setAccountId(account.getAccountId() != null ? account.getAccountId() : 0L);
        dto.setOrganizationId(org.getOrganizationId());
        dto.setOrganizationUuid(org.getOrganizationUuid().toString());
        dto.setOrganizationName(org.getName());
        dto.setActiveTierCode(account.getActiveTierCode());
        dto.setTournamentCreditsAvailable(account.getTournamentCreditsAvailable());
        dto.setTournamentCreditsReserved(account.getTournamentCreditsReserved());
        dto.setAuctionCreditsAvailable(account.getAuctionCreditsAvailable());
        dto.setAuctionCreditsReserved(account.getAuctionCreditsReserved());
        dto.setUpdatedAt(account.getUpdatedAt() != null ? account.getUpdatedAt() : LocalDateTime.now());

        // Attach plan limits and features of active tier
        planRepository.findByPlanCode(account.getActiveTierCode()).ifPresent(plan -> {
            dto.setActiveTierName(plan.getName());
            versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(plan.getPlanId())
                    .ifPresent(version -> {
                        List<SubscriptionPlanLimit> limits = limitRepository.findByVersionId(version.getVersionId());
                        Map<String, Integer> limitMap = new HashMap<>();
                        limits.forEach(l -> limitMap.put(l.getLimitCode(), l.getLimitValue()));
                        dto.setTierLimits(limitMap);

                        List<SubscriptionPlanFeature> features = featureRepository.findByVersionId(version.getVersionId());
                        Map<String, Boolean> featMap = new HashMap<>();
                        features.forEach(f -> featMap.put(f.getFeatureCode(), f.getIsEnabled() != null && f.getIsEnabled()));
                        dto.setTierFeatures(featMap);
                    });
        });

        // Attach active grants
        List<OrganizationCreditGrant> grants = account.getAccountId() != null
                ? grantRepository.findActiveGrantsForConsumption(account.getAccountId(), "TOURNAMENT_CREDIT", LocalDateTime.now())
                : Collections.emptyList();
        List<OrganizerCreditWalletDto.CreditGrantSummaryDto> grantSummaries = grants.stream().map(g -> {
            OrganizerCreditWalletDto.CreditGrantSummaryDto gDto = new OrganizerCreditWalletDto.CreditGrantSummaryDto();
            gDto.setGrantId(g.getGrantId());
            gDto.setCreditType(g.getCreditType());
            gDto.setInitialQuantity(g.getInitialQuantity());
            gDto.setRemainingQuantity(g.getRemainingQuantity());
            gDto.setSourceType(g.getSourceType());
            gDto.setExpiresAt(g.getExpiresAt());
            gDto.setStatus(g.getStatus());
            return gDto;
        }).collect(Collectors.toList());
        dto.setActiveGrants(grantSummaries);

        return dto;
    }

    private OrganizationCreditAccount buildTransientDefaultAccount(Long organizationId) {
        Optional<OrganizationSubscription> activeSubOpt = orgSubRepository.findByOrganizationIdAndStatus(organizationId, "ACTIVE");
        SubscriptionPlan resolvedPlan = null;
        SubscriptionPlanVersion resolvedVersion = null;

        if (activeSubOpt.isPresent() && activeSubOpt.get().getPackageId() != null) {
            resolvedPlan = planRepository.findById(activeSubOpt.get().getPackageId()).orElse(null);
            if (resolvedPlan != null) {
                resolvedVersion = activeSubOpt.get().getVersionId() != null
                        ? versionRepository.findById(activeSubOpt.get().getVersionId()).orElse(null)
                        : versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(resolvedPlan.getPlanId()).orElse(null);
            }
        }
        if (resolvedPlan == null) {
            resolvedPlan = planRepository.findByPlanCode("TOURNAMENT_FREE").orElse(null);
            if (resolvedPlan != null) {
                resolvedVersion = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(resolvedPlan.getPlanId()).orElse(null);
            }
        }

        String tierCode = resolvedPlan != null ? resolvedPlan.getPlanCode() : "TOURNAMENT_FREE";
        int tournamentCredits = 1;
        int includedAuctionCredits = 0;
        if (resolvedVersion != null) {
            for (SubscriptionPlanLimit lim : limitRepository.findByVersionId(resolvedVersion.getVersionId())) {
                if ("TOURNAMENT_CREDITS".equalsIgnoreCase(lim.getLimitCode()) || "TOURNAMENT_CREDIT".equalsIgnoreCase(lim.getLimitCode())) {
                    tournamentCredits = lim.getLimitValue();
                } else if ("INCLUDED_AUCTION_CREDITS".equalsIgnoreCase(lim.getLimitCode())) {
                    includedAuctionCredits = lim.getLimitValue();
                }
            }
        }
        OrganizationCreditAccount transientAcc = new OrganizationCreditAccount(organizationId, tierCode);
        transientAcc.setTournamentCreditsAvailable(tournamentCredits);
        transientAcc.setAuctionCreditsAvailable(includedAuctionCredits);
        return transientAcc;
    }

    /**
     * Atomically validates limits, checks balance, deducts 1 tournament credit, and saves allocation snapshot.
     */
    @Transactional
    public TournamentCreditAllocation consumeTournamentCredit(ConsumeTournamentCreditRequest request) {
        String tournamentUuid = request.getTournamentUuid();

        // 1. Idempotency Check: if tournament is already consumed, return existing record
        Optional<TournamentCreditAllocation> existingOpt = allocationRepository.findByTournamentUuid(tournamentUuid);
        if (existingOpt.isPresent() && "CONSUMED".equalsIgnoreCase(existingOpt.get().getStatus())) {
            log.info("Tournament {} already has an active allocation. Returning existing snapshot (idempotent).", tournamentUuid);
            return existingOpt.get();
        }

        // 2. Lock Credit Account
        OrganizationCreditAccount account = accountRepository.findByOrganizationIdForUpdate(request.getOrganizationId())
                .orElseGet(() -> getOrCreateCreditAccount(request.getOrganizationId()));

        // 3. Resolve active tier limits
        SubscriptionPlan plan = planRepository.findByPlanCode(account.getActiveTierCode())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found: " + account.getActiveTierCode()));

        SubscriptionPlanVersion version = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(plan.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("No published version for plan: " + plan.getPlanCode()));

        List<SubscriptionPlanLimit> limits = limitRepository.findByVersionId(version.getVersionId());
        Map<String, Integer> limitMap = new HashMap<>();
        limits.forEach(l -> limitMap.put(l.getLimitCode(), l.getLimitValue()));

        int maxParticipants = limitMap.getOrDefault("MAX_PARTICIPANTS", 32);
        int maxCategories = limitMap.getOrDefault("MAX_CATEGORIES", 2);
        int maxOfficials = limitMap.getOrDefault("MAX_OFFICIALS", 2);
        int maxCourts = limitMap.getOrDefault("MAX_COURTS", 2);
        boolean auctionAllowed = limitMap.getOrDefault("AUCTION_ALLOWED", 0) == 1;

        // 4. Validate limits against tournament parameters
        if (request.getParticipantCount() != null && request.getParticipantCount() > maxParticipants) {
            throw new SubscriptionEntitlementException(
                    String.format("Participant limit exceeded: %d > %d allowed by %s tier. Please upgrade.",
                            request.getParticipantCount(), maxParticipants, plan.getName()),
                    plan.getPlanCode(),
                    "MAX_PARTICIPANTS"
            );
        }
        if (request.getCategoryCount() != null && request.getCategoryCount() > maxCategories) {
            throw new SubscriptionEntitlementException(
                    String.format("Category limit exceeded: %d > %d allowed by %s tier. Please upgrade.",
                            request.getCategoryCount(), maxCategories, plan.getName()),
                    plan.getPlanCode(),
                    "MAX_CATEGORIES"
            );
        }
        if (request.getCourtCount() != null && request.getCourtCount() > maxCourts) {
            throw new SubscriptionEntitlementException(
                    String.format("Court resources limit exceeded: %d > %d allowed by %s tier. Please upgrade.",
                            request.getCourtCount(), maxCourts, plan.getName()),
                    plan.getPlanCode(),
                    "MAX_COURTS"
            );
        }
        if (request.getOfficialCount() != null && request.getOfficialCount() > maxOfficials) {
            throw new SubscriptionEntitlementException(
                    String.format("Official staff limit exceeded: %d > %d allowed by %s tier. Please upgrade.",
                            request.getOfficialCount(), maxOfficials, plan.getName()),
                    plan.getPlanCode(),
                    "MAX_OFFICIALS"
            );
        }
        if (request.getIsAuctionMode() != null && request.getIsAuctionMode() && !auctionAllowed) {
            throw new SubscriptionEntitlementException(
                    String.format("Live Auction is not allowed on %s tier. Please upgrade to Professional or Business tier.", plan.getName()),
                    plan.getPlanCode(),
                    "AUCTION_ALLOWED"
            );
        }

        // 5. Check credit balance
        if (account.getTournamentCreditsAvailable() < 1) {
            throw new SubscriptionEntitlementException(
                    "Insufficient tournament credits. You have 0 credits available. Please purchase a credit pack to publish.",
                    plan.getPlanCode(),
                    "TOURNAMENT_CREDITS"
            );
        }

        // 6. Deduct from FIFO Grants
        List<OrganizationCreditGrant> activeGrants = grantRepository.findActiveGrantsForConsumption(
                account.getAccountId(), "TOURNAMENT_CREDIT", LocalDateTime.now()
        );

        if (activeGrants.isEmpty()) {
            throw new SubscriptionEntitlementException("All tournament credit grants have expired or been exhausted. Please top up.");
        }

        OrganizationCreditGrant earliestGrant = activeGrants.get(0);
        earliestGrant.setRemainingQuantity(earliestGrant.getRemainingQuantity() - 1);
        if (earliestGrant.getRemainingQuantity() <= 0) {
            earliestGrant.setStatus("EXHAUSTED");
        }
        grantRepository.save(earliestGrant);

        // 7. Update Account Balances
        account.setTournamentCreditsAvailable(account.getTournamentCreditsAvailable() - 1);
        accountRepository.save(account);

        // 8. Record Immutable Audit Transaction
        OrganizationCreditTransaction tx = new OrganizationCreditTransaction(
                account.getAccountId(),
                "TOURNAMENT_CREDIT",
                -1,
                "CONSUMPTION",
                "TOURNAMENT",
                tournamentUuid,
                "PUB_TX_" + tournamentUuid,
                request.getNotes() != null ? request.getNotes() : "Tournament Publication Credit Consumed"
        );
        transactionRepository.save(tx);

        // 9. Save Immutable Snapshot Allocation
        TournamentCreditAllocation allocation = existingOpt.orElse(new TournamentCreditAllocation());
        allocation.setTournamentUuid(tournamentUuid);
        allocation.setOrganizationId(request.getOrganizationId());
        allocation.setAccountId(account.getAccountId());
        allocation.setPlanCode(plan.getPlanCode());
        allocation.setPlanVersion(version.getVersionNumber());
        allocation.setMaxParticipants(maxParticipants);
        allocation.setMaxCategories(maxCategories);
        allocation.setMaxOfficials(maxOfficials);
        allocation.setMaxCourts(maxCourts);
        allocation.setAuctionAllowed(auctionAllowed);
        allocation.setStatus("CONSUMED");

        allocation = allocationRepository.save(allocation);

        log.info("Tournament Credit consumed successfully for tournament {} on plan {}", tournamentUuid, plan.getPlanCode());
        return allocation;
    }

    /**
     * Atomically validates and consumes 1 live auction activation credit.
     * Idempotent: If tournament already activated, returns existing activation with 0 deductions.
     */
    @Transactional
    public AuctionCreditActivation activateLiveAuction(ConsumeAuctionCreditRequest request) {
        String tournamentUuid = request.getTournamentUuid();

        // 1. Idempotency Check
        Optional<AuctionCreditActivation> existingOpt = activationRepository.findByTournamentUuid(tournamentUuid);
        if (existingOpt.isPresent() && "ACTIVE".equalsIgnoreCase(existingOpt.get().getStatus())) {
            log.info("Tournament {} already has an active auction activation. Free re-entry (idempotent).", tournamentUuid);
            return existingOpt.get();
        }

        // 2. Lock Credit Account
        OrganizationCreditAccount account = accountRepository.findByOrganizationIdForUpdate(request.getOrganizationId())
                .orElseGet(() -> getOrCreateCreditAccount(request.getOrganizationId()));

        // 3. Verify Tier allows Auction dynamically from database plan limits
        SubscriptionPlan plan = planRepository.findByPlanCode(account.getActiveTierCode())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found: " + account.getActiveTierCode()));

        SubscriptionPlanVersion version = versionRepository.findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(plan.getPlanId())
                .orElse(null);

        boolean auctionAllowed = false;
        if (version != null) {
            List<SubscriptionPlanLimit> limits = limitRepository.findByVersionId(version.getVersionId());
            for (SubscriptionPlanLimit l : limits) {
                if ("AUCTION_ALLOWED".equalsIgnoreCase(l.getLimitCode()) && l.getLimitValue() != null && l.getLimitValue() >= 1) {
                    auctionAllowed = true;
                    break;
                }
            }
        }

        if (!auctionAllowed) {
            throw new SubscriptionEntitlementException(
                    "Your current tier (" + plan.getName() + ") does not support Live Auctions. Please upgrade to Professional or Business tier.",
                    plan.getPlanCode(),
                    "AUCTION_ALLOWED"
            );
        }

        // 4. Check Auction Credits
        if (account.getAuctionCreditsAvailable() < 1) {
            throw new SubscriptionEntitlementException(
                    "Live auction activation credit required (₹499). You have 0 activation credits available.",
                    plan.getPlanCode(),
                    "AUCTION_CREDITS"
            );
        }

        // 5. Deduct from FIFO Grants
        List<OrganizationCreditGrant> activeGrants = grantRepository.findActiveGrantsForConsumption(
                account.getAccountId(), "AUCTION_ACTIVATION_CREDIT", LocalDateTime.now()
        );

        if (activeGrants.isEmpty()) {
            throw new SubscriptionEntitlementException("All auction activation credit grants have expired or been exhausted. Please top up.");
        }

        OrganizationCreditGrant earliestGrant = activeGrants.get(0);
        earliestGrant.setRemainingQuantity(earliestGrant.getRemainingQuantity() - 1);
        if (earliestGrant.getRemainingQuantity() <= 0) {
            earliestGrant.setStatus("EXHAUSTED");
        }
        grantRepository.save(earliestGrant);

        // 6. Update Account Balances
        account.setAuctionCreditsAvailable(account.getAuctionCreditsAvailable() - 1);
        accountRepository.save(account);

        // 7. Audit Transaction
        OrganizationCreditTransaction tx = new OrganizationCreditTransaction(
                account.getAccountId(),
                "AUCTION_ACTIVATION_CREDIT",
                -1,
                "CONSUMPTION",
                "AUCTION",
                tournamentUuid,
                "ACTIVATE_AUCTION_" + tournamentUuid,
                request.getNotes() != null ? request.getNotes() : "Live Auction Activation Credit Consumed"
        );
        transactionRepository.save(tx);

        // 8. Create Activation Record
        AuctionCreditActivation activation = existingOpt.orElse(new AuctionCreditActivation());
        activation.setTournamentUuid(tournamentUuid);
        activation.setOrganizationId(request.getOrganizationId());
        activation.setAccountId(account.getAccountId());
        activation.setActivationType("PURCHASED_CREDIT");
        activation.setActivatedBy(request.getActivatedBy());
        activation.setStatus("ACTIVE");

        activation = activationRepository.save(activation);

        log.info("Auction Credit activated successfully for tournament {}", tournamentUuid);
        return activation;
    }

    /**
     * Refunds a consumed tournament publication credit upon tournament cancellation.
     */
    @Transactional
    public TournamentCreditAllocation refundTournamentCredit(RefundTournamentCreditRequest request) {
        String tournamentUuid = request.getTournamentUuid();

        TournamentCreditAllocation allocation = allocationRepository.findByTournamentUuid(tournamentUuid)
                .orElseThrow(() -> new ResourceNotFoundException("No allocation found for tournament: " + tournamentUuid));

        if ("REFUNDED".equalsIgnoreCase(allocation.getStatus())) {
            log.info("Tournament {} allocation has already been refunded.", tournamentUuid);
            return allocation;
        }

        OrganizationCreditAccount account = accountRepository.findByOrganizationIdForUpdate(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for org: " + request.getOrganizationId()));

        // Mark allocation as REFUNDED
        allocation.setStatus("REFUNDED");
        allocationRepository.save(allocation);

        // Restore 1 tournament credit to account
        account.setTournamentCreditsAvailable(account.getTournamentCreditsAvailable() + 1);
        accountRepository.save(account);

        // Create new active grant for restored credit (valid for 365 days)
        OrganizationCreditGrant refundGrant = new OrganizationCreditGrant(
                account.getAccountId(),
                "TOURNAMENT_CREDIT",
                1,
                "REFUND",
                LocalDateTime.now().plusDays(365)
        );
        grantRepository.save(refundGrant);

        // Audit Transaction
        OrganizationCreditTransaction tx = new OrganizationCreditTransaction(
                account.getAccountId(),
                "TOURNAMENT_CREDIT",
                1,
                "REFUND",
                "TOURNAMENT",
                tournamentUuid,
                "REFUND_TX_" + tournamentUuid,
                "Refund for cancelled tournament: " + (request.getReason() != null ? request.getReason() : "Organizer cancellation")
        );
        transactionRepository.save(tx);

        log.info("Tournament publication credit refunded for tournament {}", tournamentUuid);
        return allocation;
    }

    /**
     * Top-up credits via package purchase, standalone pack, or Super Admin adjustment.
     */
    @Transactional
    public OrganizerCreditWalletDto topupCredits(TopupCreditRequest request) {
        OrganizationCreditAccount account = accountRepository.findByOrganizationIdForUpdate(request.getOrganizationId())
                .orElseGet(() -> getOrCreateCreditAccount(request.getOrganizationId()));

        int validityDays = request.getValidityDays() != null && request.getValidityDays() > 0 ? request.getValidityDays() : 365;
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(validityDays);

        String oldTierCode = account.getActiveTierCode();

        // Update balances
        if ("AUCTION_ACTIVATION_CREDIT".equalsIgnoreCase(request.getCreditType())) {
            account.setAuctionCreditsAvailable(account.getAuctionCreditsAvailable() + request.getQuantity());
        } else {
            // If upgrading from TOURNAMENT_FREE with 1 unused trial credit to a paid package, replace the 1 trial credit with the package quantity
            if (request.getTargetTierCode() != null && !request.getTargetTierCode().isBlank()
                    && !"TOURNAMENT_FREE".equalsIgnoreCase(request.getTargetTierCode())
                    && "TOURNAMENT_FREE".equalsIgnoreCase(oldTierCode)
                    && account.getTournamentCreditsAvailable() <= 1) {
                account.setTournamentCreditsAvailable(request.getQuantity());
            } else {
                account.setTournamentCreditsAvailable(account.getTournamentCreditsAvailable() + request.getQuantity());
            }
        }

        SubscriptionPlan targetPlan = null;
        SubscriptionPlanVersion targetVersion = null;
        int includedAuctionCredits = 0;

        // If tier upgrade requested, update tier and sync organization_subscriptions table
        if (request.getTargetTierCode() != null && !request.getTargetTierCode().isBlank()) {
            String targetCode = request.getTargetTierCode().trim();
            account.setActiveTierCode(targetCode);

            targetPlan = planRepository.findByPlanCode(targetCode).orElse(null);
            if (targetPlan != null) {
                targetVersion = versionRepository
                        .findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(targetPlan.getPlanId())
                        .orElse(null);

                if (targetVersion != null && !"AUCTION_ACTIVATION_CREDIT".equalsIgnoreCase(request.getCreditType())) {
                    List<SubscriptionPlanLimit> limits = limitRepository.findByVersionId(targetVersion.getVersionId());
                    for (SubscriptionPlanLimit l : limits) {
                        if ("INCLUDED_AUCTION_CREDITS".equalsIgnoreCase(l.getLimitCode()) && l.getLimitValue() != null) {
                            includedAuctionCredits = l.getLimitValue();
                            break;
                        }
                    }
                    if (includedAuctionCredits > 0) {
                        account.setAuctionCreditsAvailable(account.getAuctionCreditsAvailable() + includedAuctionCredits);
                    }
                }

                // Sync organization_subscriptions so both tables reflect the active tier
                List<OrganizationSubscription> existingSubs = orgSubRepository.findByOrganizationId(request.getOrganizationId());
                for (OrganizationSubscription s : existingSubs) {
                    if ("ACTIVE".equalsIgnoreCase(s.getStatus())) {
                        s.setStatus("EXPIRED");
                        orgSubRepository.save(s);
                    }
                }

                LocalDateTime start = LocalDateTime.now();
                OrganizationSubscription newSub = new OrganizationSubscription(
                        request.getOrganizationId(),
                        targetPlan.getPlanId(),
                        start,
                        expiresAt,
                        request.getPaymentOrderId() != null ? "ORDER_" + request.getPaymentOrderId() : "PACKAGE_TOPUP"
                );
                if (targetVersion != null) {
                    newSub.setVersionId(targetVersion.getVersionId());
                }
                newSub.setBillingCycle("ONETIME");
                newSub.setStatus("ACTIVE");
                orgSubRepository.save(newSub);
            }
        }

        account = accountRepository.save(account);

        // Save FIFO Grant
        OrganizationCreditGrant grant = new OrganizationCreditGrant(
                account.getAccountId(),
                request.getCreditType(),
                request.getQuantity(),
                request.getSourceType(),
                expiresAt
        );
        grant.setPaymentOrderId(request.getPaymentOrderId());
        grantRepository.save(grant);

        // Record Audit Transaction
        String idempotency = "TOPUP_" + UUID.randomUUID();
        OrganizationCreditTransaction tx = new OrganizationCreditTransaction(
                account.getAccountId(),
                request.getCreditType(),
                request.getQuantity(),
                "GRANT",
                request.getSourceType(),
                request.getPaymentOrderId() != null ? request.getPaymentOrderId().toString() : "ADMIN",
                idempotency,
                request.getNotes() != null ? request.getNotes() : ("Topup of " + request.getQuantity() + " " + request.getCreditType())
        );
        transactionRepository.save(tx);

        // If target tier includes bundled auction credits, grant and log them too
        if (includedAuctionCredits > 0) {
            OrganizationCreditGrant auctionGrant = new OrganizationCreditGrant(
                    account.getAccountId(),
                    "AUCTION_ACTIVATION_CREDIT",
                    includedAuctionCredits,
                    request.getSourceType(),
                    expiresAt
            );
            auctionGrant.setPaymentOrderId(request.getPaymentOrderId());
            grantRepository.save(auctionGrant);

            OrganizationCreditTransaction auctionTx = new OrganizationCreditTransaction(
                    account.getAccountId(),
                    "AUCTION_ACTIVATION_CREDIT",
                    includedAuctionCredits,
                    "GRANT",
                    request.getSourceType(),
                    request.getPaymentOrderId() != null ? request.getPaymentOrderId().toString() : "PACKAGE_INCLUDED",
                    "TOPUP_INC_AUCTION_" + UUID.randomUUID(),
                    "Included Live Auction Credits with " + (targetPlan != null ? targetPlan.getName() : request.getTargetTierCode())
            );
            transactionRepository.save(auctionTx);
        }

        return getWalletByOrgId(request.getOrganizationId());
    }

    @Transactional(readOnly = true)
    public Optional<TournamentCreditAllocation> getTournamentAllocation(String tournamentUuid) {
        return allocationRepository.findByTournamentUuid(tournamentUuid);
    }

    @Transactional(readOnly = true)
    public Optional<AuctionCreditActivation> getAuctionActivation(String tournamentUuid) {
        return activationRepository.findByTournamentUuid(tournamentUuid);
    }

    @Transactional(readOnly = true)
    public Page<TournamentCreditTransactionDto> getTransactions(Long organizationId, Pageable pageable) {
        OrganizationCreditAccount account = accountRepository.findByOrganizationId(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for org: " + organizationId));

        Page<OrganizationCreditTransaction> txPage = transactionRepository.findByAccountIdOrderByCreatedAtDesc(account.getAccountId(), pageable);
        return txPage.map(tx -> {
            TournamentCreditTransactionDto dto = new TournamentCreditTransactionDto();
            dto.setTransactionId(tx.getTransactionId());
            dto.setAccountId(tx.getAccountId());
            dto.setCreditType(tx.getCreditType());
            dto.setAmount(tx.getAmount());
            dto.setTransactionType(tx.getTransactionType());
            dto.setReferenceType(tx.getReferenceType());
            dto.setReferenceId(tx.getReferenceId());
            dto.setIdempotencyKey(tx.getIdempotencyKey());
            dto.setNotes(tx.getNotes());
            dto.setCreatedAt(tx.getCreatedAt());
            return dto;
        });
    }
}

