package com.athlon.identityservice.subscription.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "subscription_packages")
public class SubscriptionPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "packageid", updatable = false, nullable = false)
    private Long packageId;

    @Column(name = "packageuuid", updatable = false, nullable = false, unique = true)
    private UUID packageUuid;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "durationmonths", nullable = false)
    private Integer durationMonths;

    @Column(name = "features", columnDefinition = "TEXT")
    private String features;

    @Column(name = "isactive")
    private Integer isActive = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public SubscriptionPackage() {
    }

    public SubscriptionPackage(String name,
                               String description,
                               BigDecimal price,
                               Integer durationMonths,
                               String features) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.durationMonths = durationMonths;
        this.features = features;
    }

    @PrePersist
    public void prePersist() {

        if (packageUuid == null) {
            packageUuid = UUID.randomUUID();
        }

        if (isActive == null) {
            isActive = 1;
        }
    }

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

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getDurationMonths() {
        return durationMonths;
    }

    public void setDurationMonths(Integer durationMonths) {
        this.durationMonths = durationMonths;
    }

    public String getFeatures() {
        return features;
    }

    public void setFeatures(String features) {
        this.features = features;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SubscriptionPackage)) return false;
        SubscriptionPackage that = (SubscriptionPackage) o;
        return Objects.equals(packageId, that.packageId)
                && Objects.equals(packageUuid, that.packageUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(packageId, packageUuid);
    }

    @Override
    public String toString() {
        return "SubscriptionPackage{" +
                "packageId=" + packageId +
                ", packageUuid=" + packageUuid +
                ", name='" + name + '\'' +
                ", price=" + price +
                ", durationMonths=" + durationMonths +
                ", isActive=" + isActive +
                '}';
    }
}