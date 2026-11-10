package com.athlon.identityservice.subscription.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TopupCreditRequest {

    @NotNull
    private Long organizationId;

    @NotBlank
    private String creditType; // TOURNAMENT_CREDIT, AUCTION_ACTIVATION_CREDIT

    @NotNull
    @Min(1)
    private Integer quantity;

    private String sourceType = "ADMIN_GRANT"; // PACKAGE_PURCHASE, TOPUP, ADMIN_GRANT, PROMOTIONAL
    private String targetTierCode; // Optional: upgrade tier code
    private Long paymentOrderId;
    private Integer validityDays;
    private String notes;

    public TopupCreditRequest() {
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getCreditType() {
        return creditType;
    }

    public void setCreditType(String creditType) {
        this.creditType = creditType;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public String getTargetTierCode() {
        return targetTierCode;
    }

    public void setTargetTierCode(String targetTierCode) {
        this.targetTierCode = targetTierCode;
    }

    public Long getPaymentOrderId() {
        return paymentOrderId;
    }

    public void setPaymentOrderId(Long paymentOrderId) {
        this.paymentOrderId = paymentOrderId;
    }

    public Integer getValidityDays() {
        return validityDays;
    }

    public void setValidityDays(Integer validityDays) {
        this.validityDays = validityDays;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

