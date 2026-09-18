package com.athlon.identityservice.rewards.entity;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.athlon.identityservice.rewards.enums.CreditRuleCategory;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "credit_rules")
public class CreditRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id", updatable = false, nullable = false)
    private Long ruleId;

    @Column(name = "rule_uuid", updatable = false, nullable = false, unique = true)
    private UUID ruleUuid;

    @Column(name = "rule_key", nullable = false, unique = true, length = 100)
    private String ruleKey;

    @Column(name = "rule_name", nullable = false, length = 150)
    private String ruleName;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private CreditRuleCategory category;

    @Column(name = "credit_amount", nullable = false)
    private Integer creditAmount = 0;

    @Column(name = "min_threshold")
    private Integer minThreshold = 0;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_active", nullable = false)
    private Integer isActive = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    public CreditRule() {
    }

    public CreditRule(String ruleKey, String ruleName, CreditRuleCategory category, Integer creditAmount, Integer minThreshold, String description, Long createdBy) {
        this.ruleKey = ruleKey;
        this.ruleName = ruleName;
        this.category = category;
        this.creditAmount = creditAmount;
        this.minThreshold = minThreshold != null ? minThreshold : 0;
        this.description = description;
        this.isActive = 1;
        this.createdBy = createdBy;
    }

    @PrePersist
    public void prePersist() {
        if (ruleUuid == null) {
            ruleUuid = UUID.randomUUID();
        }
        if (creditAmount == null) {
            creditAmount = 0;
        }
        if (minThreshold == null) {
            minThreshold = 0;
        }
        if (isActive == null) {
            isActive = 1;
        }
    }

    public Long getRuleId() {
        return ruleId;
    }

    public void setRuleId(Long ruleId) {
        this.ruleId = ruleId;
    }

    public UUID getRuleUuid() {
        return ruleUuid;
    }

    public void setRuleUuid(UUID ruleUuid) {
        this.ruleUuid = ruleUuid;
    }

    public String getRuleKey() {
        return ruleKey;
    }

    public void setRuleKey(String ruleKey) {
        this.ruleKey = ruleKey;
    }

    public String getRuleName() {
        return ruleName;
    }

    public void setRuleName(String ruleName) {
        this.ruleName = ruleName;
    }

    public CreditRuleCategory getCategory() {
        return category;
    }

    public void setCategory(CreditRuleCategory category) {
        this.category = category;
    }

    public Integer getCreditAmount() {
        return creditAmount;
    }

    public void setCreditAmount(Integer creditAmount) {
        this.creditAmount = creditAmount;
    }

    public Integer getMinThreshold() {
        return minThreshold;
    }

    public void setMinThreshold(Integer minThreshold) {
        this.minThreshold = minThreshold;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CreditRule)) return false;
        CreditRule that = (CreditRule) o;
        return Objects.equals(ruleId, that.ruleId) &&
               Objects.equals(ruleKey, that.ruleKey);
    }

    @Override
    public int hashCode() {
        return Objects.hash(ruleId, ruleKey);
    }
}
