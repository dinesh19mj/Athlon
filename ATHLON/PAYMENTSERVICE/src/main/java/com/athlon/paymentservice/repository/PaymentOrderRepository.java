package com.athlon.paymentservice.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.paymentservice.entity.PaymentOrder;
import com.athlon.paymentservice.enums.PaymentStatus;

@Repository
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, UUID> {

    Optional<PaymentOrder> findByPaymentNumber(String paymentNumber);

    Optional<PaymentOrder> findByProviderOrderId(String providerOrderId);

    Optional<PaymentOrder> findByIdempotencyKey(String idempotencyKey);

    Optional<PaymentOrder> findByReferenceTypeAndReferenceIdAndStatus(String referenceType, String referenceId, PaymentStatus status);

    List<PaymentOrder> findByReferenceTypeAndReferenceId(String referenceType, String referenceId);

    List<PaymentOrder> findByPayeeRecipientIdOrderByCreatedAtDesc(UUID payeeRecipientId);

    List<PaymentOrder> findByPayerUserIdOrderByCreatedAtDesc(String payerUserId);
}
