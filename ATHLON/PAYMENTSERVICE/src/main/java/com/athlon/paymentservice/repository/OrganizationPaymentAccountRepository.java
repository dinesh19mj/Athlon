package com.athlon.paymentservice.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.paymentservice.entity.OrganizationPaymentAccount;

@Repository
public interface OrganizationPaymentAccountRepository extends JpaRepository<OrganizationPaymentAccount, UUID> {

    Optional<OrganizationPaymentAccount> findByOrganizationId(UUID organizationId);

    Optional<OrganizationPaymentAccount> findByProviderAccountId(String providerAccountId);

    boolean existsByOrganizationId(UUID organizationId);
}
