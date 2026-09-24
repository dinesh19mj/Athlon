package com.athlon.paymentservice.dto;

import java.time.LocalDateTime;

import com.athlon.paymentservice.enums.PaymentStatus;

public class VerifyPaymentResponse {

    private boolean verified;
    private PaymentStatus paymentStatus;
    private String paymentNumber;
    private String providerPaymentId;
    private String message;
    private LocalDateTime completedAt;

    public VerifyPaymentResponse() {
    }

    public VerifyPaymentResponse(boolean verified, PaymentStatus paymentStatus, String paymentNumber, String providerPaymentId, String message, LocalDateTime completedAt) {
        this.verified = verified;
        this.paymentStatus = paymentStatus;
        this.paymentNumber = paymentNumber;
        this.providerPaymentId = providerPaymentId;
        this.message = message;
        this.completedAt = completedAt;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentNumber() {
        return paymentNumber;
    }

    public void setPaymentNumber(String paymentNumber) {
        this.paymentNumber = paymentNumber;
    }

    public String getProviderPaymentId() {
        return providerPaymentId;
    }

    public void setProviderPaymentId(String providerPaymentId) {
        this.providerPaymentId = providerPaymentId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
