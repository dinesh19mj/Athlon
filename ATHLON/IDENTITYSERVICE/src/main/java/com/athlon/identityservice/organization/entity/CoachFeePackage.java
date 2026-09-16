package com.athlon.identityservice.organization.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "coach_fee_packages")
public class CoachFeePackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "package_id", updatable = false, nullable = false)
    private Long packageId;

    @Column(name = "package_uuid", updatable = false, nullable = false, unique = true)
    private UUID packageUuid;

    @Column(name = "organization_id")
    private Long organizationId;

    @Column(name = "organization_uuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "category", length = 50)
    private String category; // 1on1, group, monthly, sparring, camp

    @Column(name = "category_label", length = 100)
    private String categoryLabel;

    @Column(name = "price", precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "billing_cycle", length = 50)
    private String billingCycle; // per_session, per_hour, monthly, quarterly

    @Column(name = "sessions_per_week")
    private Integer sessionsPerWeek = 3;

    @Column(name = "max_trainees")
    private Integer maxTrainees = 1;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "features", columnDefinition = "TEXT")
    private String features; // JSON array string of features

    @Column(name = "is_popular")
    private Boolean isPopular = false;

    @Column(name = "active")
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CoachFeePackage() {
    }

    @PrePersist
    public void prePersist() {
        if (this.packageUuid == null) {
            this.packageUuid = UUID.randomUUID();
        }
        if (this.active == null) {
            this.active = true;
        }
        if (this.isPopular == null) {
            this.isPopular = false;
        }
        if (this.sessionsPerWeek == null) {
            this.sessionsPerWeek = 3;
        }
        if (this.maxTrainees == null) {
            this.maxTrainees = 1;
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getPackageId() {
        return packageId;
    }

    public void setPackageId(Long packageId) {
        this.packageId = packageId;
    }

    public UUID getPackageUuid() {
        return packageUuid;
    }

    public void setPackageUuid(UUID packageUuid) {
        this.packageUuid = packageUuid;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCategoryLabel() {
        return categoryLabel;
    }

    public void setCategoryLabel(String categoryLabel) {
        this.categoryLabel = categoryLabel;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getBillingCycle() {
        return billingCycle;
    }

    public void setBillingCycle(String billingCycle) {
        this.billingCycle = billingCycle;
    }

    public Integer getSessionsPerWeek() {
        return sessionsPerWeek;
    }

    public void setSessionsPerWeek(Integer sessionsPerWeek) {
        this.sessionsPerWeek = sessionsPerWeek;
    }

    public Integer getMaxTrainees() {
        return maxTrainees;
    }

    public void setMaxTrainees(Integer maxTrainees) {
        this.maxTrainees = maxTrainees;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFeatures() {
        return features;
    }

    public void setFeatures(String features) {
        this.features = features;
    }

    public Boolean getIsPopular() {
        return isPopular;
    }

    public void setIsPopular(Boolean isPopular) {
        this.isPopular = isPopular;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CoachFeePackage that = (CoachFeePackage) o;
        return Objects.equals(packageUuid, that.packageUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(packageUuid);
    }
}
