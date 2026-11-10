package com.athlon.identityservice.subscription.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id", updatable = false, nullable = false)
    private Long planId;

    @Column(name = "plan_uuid", updatable = false, nullable = false, unique = true)
    private UUID planUuid = UUID.randomUUID();

    @Column(name = "plan_code", nullable = false, unique = true, length = 64)
    private String planCode; // e.g. VENUE_FREE, VENUE_STARTER, VENUE_PRO, VENUE_BUSINESS, VENUE_ENTERPRISE

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "target_module", nullable = false, length = 32)
    private String targetModule = "VENUE"; // VENUE, TOURNAMENT, ACADEMY, CLUB

    @Column(name = "is_active", nullable = false)
    private Integer isActive = 1;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public SubscriptionPlan() {
    }

    public SubscriptionPlan(String planCode, String name, String description, String targetModule, Integer displayOrder) {
        this.planCode = planCode;
        this.name = name;
        this.description = description;
        this.targetModule = targetModule != null ? targetModule : "VENUE";
        this.displayOrder = displayOrder != null ? displayOrder : 0;
        this.planUuid = UUID.randomUUID();
        this.isActive = 1;
    }

    @PrePersist
    protected void onCreate() {
        if (this.planUuid == null) {
            this.planUuid = UUID.randomUUID();
        }
        if (this.isActive == null) {
            this.isActive = 1;
        }
    }

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public UUID getPlanUuid() {
        return planUuid;
    }

    public void setPlanUuid(UUID planUuid) {
        this.planUuid = planUuid;
    }

    public String getPlanCode() {
        return planCode;
    }

    public void setPlanCode(String planCode) {
        this.planCode = planCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTargetModule() {
        return targetModule;
    }

    public void setTargetModule(String targetModule) {
        this.targetModule = targetModule;
    }

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}

