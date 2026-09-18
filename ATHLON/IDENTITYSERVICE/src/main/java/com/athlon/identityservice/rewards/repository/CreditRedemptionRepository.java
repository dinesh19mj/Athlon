package com.athlon.identityservice.rewards.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.rewards.entity.CreditRedemption;
import com.athlon.identityservice.rewards.enums.RedemptionType;

@Repository
public interface CreditRedemptionRepository extends JpaRepository<CreditRedemption, Long> {

    List<CreditRedemption> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<CreditRedemption> findByTargetId(String targetId);

    Optional<CreditRedemption> findByTargetIdAndRedemptionType(String targetId, RedemptionType redemptionType);
}
