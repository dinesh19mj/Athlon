package com.athlon.identityservice.oganizationsubscription.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "organization_subscriptions")
public class OrganizationSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subscriptionid", updatable = false, nullable = false)
    private Long organizationSubscriptionId;

    @Column(name = "subscriptionuuid", updatable = false, nullable = false, unique = true)
    private UUID organizationSubscriptionUuid;

    @Column(name = "organizationid", nullable = false)
    private Long organizationId;

    @Column(name = "packageid", nullable = false)
    private Long packageId;

    @Column(name = "startdate", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "enddate", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "paymentreference", length = 255)
    private String paymentReference;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public OrganizationSubscription() {
    }

    public OrganizationSubscription(Long organizationId,
                                    Long packageId,
                                    LocalDateTime startDate,
                                    LocalDateTime endDate,
                                    String paymentReference) {

        this.organizationId = organizationId;
        this.packageId = packageId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.paymentReference = paymentReference;
        this.status = "ACTIVE";
    }

    @PrePersist
    public void prePersist() {
        if (organizationSubscriptionUuid == null) {
            organizationSubscriptionUuid = UUID.randomUUID();
        }

        if (status == null) {
            status = "ACTIVE";
        }
    }

    public Long getOrganizationSubscriptionId() {
        return organizationSubscriptionId;
    }

    public void setOrganizationSubscriptionId(Long organizationSubscriptionId) {
        this.organizationSubscriptionId = organizationSubscriptionId;
    }

    public UUID getOrganizationSubscriptionUuid() {
        return organizationSubscriptionUuid;
    }

    public void setOrganizationSubscriptionUuid(UUID organizationSubscriptionUuid) {
        this.organizationSubscriptionUuid = organizationSubscriptionUuid;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public Long getPackageId() {
        return packageId;
    }

    public void setPackageId(Long packageId) {
        this.packageId = packageId;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
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
        if (!(o instanceof OrganizationSubscription)) return false;
        OrganizationSubscription that = (OrganizationSubscription) o;
        return Objects.equals(organizationSubscriptionId, that.organizationSubscriptionId)
                && Objects.equals(organizationSubscriptionUuid, that.organizationSubscriptionUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(organizationSubscriptionId, organizationSubscriptionUuid);
    }

    @Override
    public String toString() {
        return "OrganizationSubscription{" +
                "organizationSubscriptionId=" + organizationSubscriptionId +
                ", organizationSubscriptionUuid=" + organizationSubscriptionUuid +
                ", organizationId=" + organizationId +
                ", packageId=" + packageId +
                ", status='" + status + '\'' +
                ", paymentReference='" + paymentReference + '\'' +
                '}';
    }
}