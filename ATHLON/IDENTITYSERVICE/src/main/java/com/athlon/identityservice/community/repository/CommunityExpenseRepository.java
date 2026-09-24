package com.athlon.identityservice.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.community.entity.CommunityExpense;

@Repository
public interface CommunityExpenseRepository extends JpaRepository<CommunityExpense, Long> {

    List<CommunityExpense> findByCommunityUuidOrderByExpenseDateDescCreatedAtDesc(UUID communityUuid);

    Optional<CommunityExpense> findByExpenseUuid(UUID expenseUuid);
}
