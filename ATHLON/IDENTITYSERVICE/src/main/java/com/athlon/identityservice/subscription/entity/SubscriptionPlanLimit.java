package com.athlon.identityservice.subscription.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "subscription_plan_limits")
public class SubscriptionPlanLimit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "limit_id", updatable = false, nullable = false)
    private Long limitId;

    @Column(name = "version_id", nullable = false)
    private Long versionId;

    @Column(name = "limit_code", nullable = false, length = 64)
    private String limitCode; // MAX_VENUES, MAX_FACILITIES, MAX_STAFF, etc.

    @Column(name = "limit_value", nullable = false)
    private Integer limitValue = 1;

    public SubscriptionPlanLimit() {
    }

    public SubscriptionPlanLimit(Long versionId, String limitCode, Integer limitValue) {
        this.versionId = versionId;
        this.limitCode = limitCode;
        this.limitValue = limitValue != null ? limitValue : 1;
    }

    public Long getLimitId() {
        return limitId;
    }

    public void setLimitId(Long limitId) {
        this.limitId = limitId;
    }

    public Long getVersionId() {
        return versionId;
    }

    public void setVersionId(Long versionId) {
        this.versionId = versionId;
    }

    public String getLimitCode() {
        return limitCode;
    }

    public void setLimitCode(String limitCode) {
        this.limitCode = limitCode;
    }

    public Integer getLimitValue() {
        return limitValue;
    }

    public void setLimitValue(Integer limitValue) {
        this.limitValue = limitValue;
    }
}

