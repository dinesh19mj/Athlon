package com.athlon.identityservice.subscription.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "subscription_packages")
public class SubscriptionPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "packageid", updatable = false, nullable = false)
    private Long id;

    @Column(name = "packageuuid", updatable = false, nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "name", nullable = false, length = 100, unique = true)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "durationmonths", nullable = false)
    private Integer durationMonths;

    @Column(name = "features", columnDefinition = "TEXT")
    private String features; // JSON string mapping of features

    @Column(name = "isactive", nullable = false)
    private Integer isActive = 1;

    @Column(name = "createdon", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "modifiedon")
    private LocalDateTime updatedAt;

    public SubscriptionPackage() {
    }

    public SubscriptionPackage(String name, String description, BigDecimal price, Integer durationMonths, String features) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.durationMonths = durationMonths;
        this.features = features;
    }

    @PrePersist
    protected void onCreate() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getDurationMonths() { return durationMonths; }
    public void setDurationMonths(Integer durationMonths) { this.durationMonths = durationMonths; }

    public String getFeatures() { return features; }
    public void setFeatures(String features) { this.features = features; }

    public Integer getIsActive() { return isActive; }
    public void setIsActive(Integer active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SubscriptionPackage that = (SubscriptionPackage) o;
        return Objects.equals(id, that.id) && Objects.equals(uuid, that.uuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uuid);
    }
}
