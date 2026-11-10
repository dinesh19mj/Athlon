package com.athlon.identityservice.subscription.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "subscription_plan_prices")
public class SubscriptionPlanPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "price_id", updatable = false, nullable = false)
    private Long priceId;

    @Column(name = "version_id", nullable = false)
    private Long versionId;

    @Column(name = "billing_cycle", nullable = false, length = 20)
    private String billingCycle; // MONTHLY, YEARLY

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "INR";

    public SubscriptionPlanPrice() {
    }

    public SubscriptionPlanPrice(Long versionId, String billingCycle, BigDecimal amount, String currency) {
        this.versionId = versionId;
        this.billingCycle = billingCycle;
        this.amount = amount != null ? amount : BigDecimal.ZERO;
        this.currency = currency != null ? currency : "INR";
    }

    public Long getPriceId() {
        return priceId;
    }

    public void setPriceId(Long priceId) {
        this.priceId = priceId;
    }

    public Long getVersionId() {
        return versionId;
    }

    public void setVersionId(Long versionId) {
        this.versionId = versionId;
    }

    public String getBillingCycle() {
        return billingCycle;
    }

    public void setBillingCycle(String billingCycle) {
        this.billingCycle = billingCycle;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}

