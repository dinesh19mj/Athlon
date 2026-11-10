package com.athlon.identityservice.subscription.repository;

import com.athlon.identityservice.subscription.entity.OrganizationCreditAccount;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationCreditAccountRepository extends JpaRepository<OrganizationCreditAccount, Long> {

    Optional<OrganizationCreditAccount> findByOrganizationId(Long organizationId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM OrganizationCreditAccount a WHERE a.organizationId = :organizationId")
    Optional<OrganizationCreditAccount> findByOrganizationIdForUpdate(@Param("organizationId") Long organizationId);
}

