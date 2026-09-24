package com.athlon.paymentservice.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.paymentservice.entity.PaymentOrder;
import com.athlon.paymentservice.entity.PaymentRefund;

@Repository
public interface PaymentRefundRepository extends JpaRepository<PaymentRefund, UUID> {

    Optional<PaymentRefund> findByProviderRefundId(String providerRefundId);

    List<PaymentRefund> findByPaymentOrder(PaymentOrder paymentOrder);
}
