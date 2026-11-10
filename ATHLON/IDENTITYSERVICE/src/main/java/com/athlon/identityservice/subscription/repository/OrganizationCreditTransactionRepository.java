package com.athlon.identityservice.subscription.repository;

import com.athlon.identityservice.subscription.entity.OrganizationCreditTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationCreditTransactionRepository extends JpaRepository<OrganizationCreditTransaction, Long> {

    Optional<OrganizationCreditTransaction> findByIdempotencyKey(String idempotencyKey);

    List<OrganizationCreditTransaction> findByAccountIdOrderByCreatedAtDesc(Long accountId);

    Page<OrganizationCreditTransaction> findByAccountIdOrderByCreatedAtDesc(Long accountId, Pageable pageable);
}

