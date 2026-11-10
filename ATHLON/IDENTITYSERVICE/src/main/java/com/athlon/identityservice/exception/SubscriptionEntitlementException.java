package com.athlon.identityservice.exception;

public class SubscriptionEntitlementException extends RuntimeException {
    private String requiredPlan;
    private String limitCode;

    public SubscriptionEntitlementException(String message) {
        super(message);
    }

    public SubscriptionEntitlementException(String message, String requiredPlan, String limitCode) {
        super(message);
        this.requiredPlan = requiredPlan;
        this.limitCode = limitCode;
    }

    public String getRequiredPlan() {
        return requiredPlan;
    }

    public String getLimitCode() {
        return limitCode;
    }
}

