package com.athlon.paymentservice.dto;

import com.athlon.paymentservice.enums.PaymentPurpose;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateOrderRequest {

    @NotNull(message = "Payment purpose is required")
    private PaymentPurpose purpose;

    @NotBlank(message = "Reference ID is required")
    private String referenceId;

    private String payerEmail;
    private String payerPhone;
    private String payerName;
    private String idempotencyKey;

    public CreateOrderRequest() {
    }

    public PaymentPurpose getPurpose() {
        return purpose;
    }

    public void setPurpose(PaymentPurpose purpose) {
        this.purpose = purpose;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getPayerEmail() {
        return payerEmail;
    }

    public void setPayerEmail(String payerEmail) {
        this.payerEmail = payerEmail;
    }

    public String getPayerPhone() {
        return payerPhone;
    }

    public void setPayerPhone(String payerPhone) {
        this.payerPhone = payerPhone;
    }

    public String getPayerName() {
        return payerName;
    }

    public void setPayerName(String payerName) {
        this.payerName = payerName;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }
}
