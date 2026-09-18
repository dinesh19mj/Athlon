package com.athlon.identityservice.rewards.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.rewards.entity.CreditRule;
import com.athlon.identityservice.rewards.enums.CreditRuleCategory;

@Repository
public interface CreditRuleRepository extends JpaRepository<CreditRule, Long> {

    Optional<CreditRule> findByRuleKey(String ruleKey);

    Optional<CreditRule> findByRuleUuid(UUID ruleUuid);

    List<CreditRule> findByIsActive(Integer isActive);

    List<CreditRule> findByCategoryAndIsActive(CreditRuleCategory category, Integer isActive);

    boolean existsByRuleKey(String ruleKey);
}
