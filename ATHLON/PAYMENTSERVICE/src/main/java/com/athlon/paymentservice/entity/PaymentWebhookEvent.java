package com.athlon.paymentservice.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Table(name = "payment_webhook_event", indexes = {
    @Index(name = "idx_webhook_provider_event_id", columnList = "provider_event_id", unique = true),
    @Index(name = "idx_webhook_event_type", columnList = "event_type")
})
public class PaymentWebhookEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "provider", nullable = false, length = 32)
    private String provider = "RAZORPAY";

    @Column(name = "provider_event_id", nullable = false, unique = true, length = 128)
    private String providerEventId;

    @Column(name = "event_type", nullable = false, length = 64)
    private String eventType;

    @Column(name = "payload", columnDefinition = "TEXT", nullable = false)
    private String payload;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "RECEIVED"; // RECEIVED, PROCESSED, FAILED, IGNORED

    @Column(name = "error_message", length = 512)
    private String errorMessage;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public PaymentWebhookEvent() {
    }

    public PaymentWebhookEvent(String provider, String providerEventId, String eventType, String payload) {
        this.provider = provider;
        this.providerEventId = providerEventId;
        this.eventType = eventType;
        this.payload = payload;
        this.status = "RECEIVED";
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getProviderEventId() {
        return providerEventId;
    }

    public void setProviderEventId(String providerEventId) {
        this.providerEventId = providerEventId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
