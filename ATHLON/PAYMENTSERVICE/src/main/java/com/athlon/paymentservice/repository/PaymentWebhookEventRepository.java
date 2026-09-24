package com.athlon.paymentservice.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.paymentservice.entity.PaymentWebhookEvent;

@Repository
public interface PaymentWebhookEventRepository extends JpaRepository<PaymentWebhookEvent, UUID> {

    Optional<PaymentWebhookEvent> findByProviderAndProviderEventId(String provider, String providerEventId);

    boolean existsByProviderAndProviderEventId(String provider, String providerEventId);
}
