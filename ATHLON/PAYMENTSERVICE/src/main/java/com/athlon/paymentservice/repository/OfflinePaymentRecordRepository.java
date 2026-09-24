package com.athlon.paymentservice.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.paymentservice.entity.OfflinePaymentRecord;
import com.athlon.paymentservice.enums.OfflinePaymentStatus;
import com.athlon.paymentservice.enums.PaymentPurpose;

@Repository
public interface OfflinePaymentRecordRepository extends JpaRepository<OfflinePaymentRecord, UUID> {

    List<OfflinePaymentRecord> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);

    List<OfflinePaymentRecord> findByOrganizationIdAndStatusOrderByCreatedAtDesc(UUID organizationId, OfflinePaymentStatus status);

    List<OfflinePaymentRecord> findByEntityIdAndPurposeOrderByCreatedAtDesc(UUID entityId, PaymentPurpose purpose);

    List<OfflinePaymentRecord> findByPayerIdOrderByCreatedAtDesc(UUID payerId);

    Optional<OfflinePaymentRecord> findByEntityIdAndPurposeAndPayerId(UUID entityId, PaymentPurpose purpose, UUID payerId);
}
