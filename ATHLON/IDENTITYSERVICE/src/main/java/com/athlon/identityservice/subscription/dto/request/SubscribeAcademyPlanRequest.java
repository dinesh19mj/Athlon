package com.athlon.identityservice.subscription.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SubscribeAcademyPlanRequest {

    @NotNull
    private Long organizationId;

    @NotBlank
    private String planCode; // ACADEMY_FREE, ACADEMY_STARTER, ACADEMY_PRO, ACADEMY_BUSINESS

    private String billingCycle = "MONTHLY"; // MONTHLY, YEARLY
    private String paymentReference;

    public SubscribeAcademyPlanRequest() {
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getPlanCode() {
        return planCode;
    }

    public void setPlanCode(String planCode) {
        this.planCode = planCode;
    }

    public String getBillingCycle() {
        return billingCycle;
    }

    public void setBillingCycle(String billingCycle) {
        this.billingCycle = billingCycle;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }
}

