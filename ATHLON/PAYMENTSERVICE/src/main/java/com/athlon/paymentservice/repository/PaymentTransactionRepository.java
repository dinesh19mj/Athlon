package com.athlon.paymentservice.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.paymentservice.entity.PaymentOrder;
import com.athlon.paymentservice.entity.PaymentTransaction;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {

    Optional<PaymentTransaction> findByProviderPaymentId(String providerPaymentId);

    List<PaymentTransaction> findByPaymentOrder(PaymentOrder paymentOrder);

    List<PaymentTransaction> findByPaymentOrderId(UUID paymentOrderId);
}
