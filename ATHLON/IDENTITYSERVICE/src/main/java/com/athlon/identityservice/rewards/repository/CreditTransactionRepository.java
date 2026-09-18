package com.athlon.identityservice.rewards.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.rewards.entity.CreditTransaction;
import com.athlon.identityservice.rewards.enums.CreditSourceType;
import com.athlon.identityservice.rewards.enums.TransactionType;

@Repository
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {

    List<CreditTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<CreditTransaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<CreditTransaction> findByUserIdAndTransactionTypeOrderByCreatedAtDesc(Long userId, TransactionType transactionType, Pageable pageable);

    Page<CreditTransaction> findByUserIdAndSourceTypeOrderByCreatedAtDesc(Long userId, CreditSourceType sourceType, Pageable pageable);

    List<CreditTransaction> findByReferenceId(String referenceId);
}
