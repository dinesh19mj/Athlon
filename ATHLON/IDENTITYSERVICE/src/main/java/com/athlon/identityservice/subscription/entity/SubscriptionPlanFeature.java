package com.athlon.identityservice.subscription.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "subscription_plan_features")
public class SubscriptionPlanFeature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_feature_id", updatable = false, nullable = false)
    private Long planFeatureId;

    @Column(name = "version_id", nullable = false)
    private Long versionId;

    @Column(name = "feature_code", nullable = false, length = 64)
    private String featureCode;

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled = true;

    public SubscriptionPlanFeature() {
    }

    public SubscriptionPlanFeature(Long versionId, String featureCode, Boolean isEnabled) {
        this.versionId = versionId;
        this.featureCode = featureCode;
        this.isEnabled = isEnabled != null ? isEnabled : true;
    }

    public Long getPlanFeatureId() {
        return planFeatureId;
    }

    public void setPlanFeatureId(Long planFeatureId) {
        this.planFeatureId = planFeatureId;
    }

    public Long getVersionId() {
        return versionId;
    }

    public void setVersionId(Long versionId) {
        this.versionId = versionId;
    }

    public String getFeatureCode() {
        return featureCode;
    }

    public void setFeatureCode(String featureCode) {
        this.featureCode = featureCode;
    }

    public Boolean getIsEnabled() {
        return isEnabled;
    }

    public void setIsEnabled(Boolean isEnabled) {
        this.isEnabled = isEnabled;
    }
}

