package com.athlon.identityservice.rewards.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.athlon.identityservice.rewards.entity.CreditRule;
import com.athlon.identityservice.rewards.enums.CreditRuleCategory;
import com.athlon.identityservice.rewards.enums.CreditRuleKey;
import com.athlon.identityservice.rewards.repository.CreditRuleRepository;

@Component
public class RewardsDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(RewardsDataInitializer.class);

    private final CreditRuleRepository creditRuleRepository;

    public RewardsDataInitializer(CreditRuleRepository creditRuleRepository) {
        this.creditRuleRepository = creditRuleRepository;
    }

    @Override
    public void run(String... args) {
        try {
            seedDefaultRules();
        } catch (Exception e) {
            log.warn("Could not seed default credit rules on startup: {}", e.getMessage());
        }
    }

    private void seedDefaultRules() {
        List<CreditRule> defaults = List.of(
                new CreditRule(
                        CreditRuleKey.REFERRAL_SIGNUP_REFERRER.name(),
                        "Referral Signup Bonus (Referrer)",
                        CreditRuleCategory.REFERRAL,
                        50,
                        0,
                        "Credits awarded to the referrer when an invited athlete signs up with their code",
                        1L
                ),
                new CreditRule(
                        CreditRuleKey.REFERRAL_SIGNUP_REFEREE.name(),
                        "Referral Welcome Bonus (Referee)",
                        CreditRuleCategory.REFERRAL,
                        25,
                        0,
                        "Welcome bonus credits awarded to a newly joined athlete using a referral code",
                        1L
                ),
                new CreditRule(
                        CreditRuleKey.TOURNAMENT_CONDUCTED_ORGANIZER.name(),
                        "Organizer Tournament Conduction Reward",
                        CreditRuleCategory.ORGANIZER_REWARD,
                        100,
                        0,
                        "Credits awarded to the tournament organizer upon successfully conducting and completing a tournament",
                        1L
                ),
                new CreditRule(
                        CreditRuleKey.TOURNAMENT_PARTICIPATION_PLAYER.name(),
                        "Player Tournament Participation Reward",
                        CreditRuleCategory.PLAYER_REWARD,
                        20,
                        0,
                        "Credits awarded to a player for participating in a sports tournament",
                        1L
                ),
                new CreditRule(
                        CreditRuleKey.ORGANIZER_SUBSCRIPTION_CREDIT_COST.name(),
                        "Tournament Organizer Subscription Package Credit Cost",
                        CreditRuleCategory.REDEMPTION,
                        500,
                        500,
                        "Credits required to subscribe to the Tournament Organizer subscription package to conduct free tournaments",
                        1L
                ),
                new CreditRule(
                        CreditRuleKey.ORGANIZER_FREE_TOURNAMENT_COST.name(),
                        "Organizer Free Single Tournament Hosting Cost",
                        CreditRuleCategory.REDEMPTION,
                        300,
                        300,
                        "Credits required for an organizer to conduct an individual 100% free tournament",
                        1L
                )
        );

        for (CreditRule rule : defaults) {
            if (!creditRuleRepository.existsByRuleKey(rule.getRuleKey())) {
                creditRuleRepository.save(rule);
                log.info("Seeded dynamic credit rule: {}", rule.getRuleKey());
            }
        }
    }
}
