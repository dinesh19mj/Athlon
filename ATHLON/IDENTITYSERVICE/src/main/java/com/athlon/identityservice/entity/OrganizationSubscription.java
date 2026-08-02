package com.athlon.identityservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "organization_subscriptions")
public class OrganizationSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subscriptionid", updatable = false, nullable = false)
    private Long id;

    @Column(name = "subscriptionuuid", updatable = false, nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "organizationid", nullable = false)
    private Long organizationId;

    @Column(name = "packageid", nullable = false)
    private Long packageId;

    @Column(name = "startdate", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "enddate", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // e.g., ACTIVE, EXPIRED, CANCELLED

    @Column(name = "paymentreference", length = 255)
    private String paymentReference;

    @Column(name = "createdon", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "modifiedon")
    private LocalDateTime updatedAt;

    public OrganizationSubscription() {
    }

    public OrganizationSubscription(Long organizationId, Long packageId, LocalDateTime startDate, LocalDateTime endDate, String paymentReference) {
        this.organizationId = organizationId;
        this.packageId = packageId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = "ACTIVE";
        this.paymentReference = paymentReference;
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

    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }

    public Long getPackageId() { return packageId; }
    public void setPackageId(Long packageId) { this.packageId = packageId; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrganizationSubscription that = (OrganizationSubscription) o;
        return Objects.equals(id, that.id) && Objects.equals(uuid, that.uuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uuid);
    }
}
