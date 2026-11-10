package com.athlon.identityservice.subscription.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_plan_versions")
public class SubscriptionPlanVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "version_id", updatable = false, nullable = false)
    private Long versionId;

    @Column(name = "plan_id", nullable = false)
    private Long planId;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber = 1;

    @Column(name = "marketplace_commission_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal marketplaceCommissionRate = BigDecimal.valueOf(5.00);

    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public SubscriptionPlanVersion() {
    }

    public SubscriptionPlanVersion(Long planId, Integer versionNumber, BigDecimal marketplaceCommissionRate, Boolean isPublished) {
        this.planId = planId;
        this.versionNumber = versionNumber != null ? versionNumber : 1;
        this.marketplaceCommissionRate = marketplaceCommissionRate != null ? marketplaceCommissionRate : BigDecimal.valueOf(5.00);
        this.isPublished = isPublished != null ? isPublished : true;
    }

    public Long getVersionId() {
        return versionId;
    }

    public void setVersionId(Long versionId) {
        this.versionId = versionId;
    }

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public Integer getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(Integer versionNumber) {
        this.versionNumber = versionNumber;
    }

    public BigDecimal getMarketplaceCommissionRate() {
        return marketplaceCommissionRate;
    }

    public void setMarketplaceCommissionRate(BigDecimal marketplaceCommissionRate) {
        this.marketplaceCommissionRate = marketplaceCommissionRate;
    }

    public Boolean getIsPublished() {
        return isPublished;
    }

    public void setIsPublished(Boolean isPublished) {
        this.isPublished = isPublished;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}

