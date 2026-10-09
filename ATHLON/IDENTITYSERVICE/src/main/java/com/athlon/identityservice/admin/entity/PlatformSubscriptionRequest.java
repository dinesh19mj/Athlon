package com.athlon.identityservice.admin.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "platform_subscription_requests")
public class PlatformSubscriptionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id", updatable = false, nullable = false)
    private Long requestId;

    @Column(name = "request_uuid", updatable = false, nullable = false, unique = true)
    private UUID requestUuid = UUID.randomUUID();

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(name = "organization_uuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "package_id", nullable = false)
    private Long packageId;

    @Column(name = "package_uuid", nullable = false)
    private UUID packageUuid;

    @Column(name = "package_snapshot", columnDefinition = "jsonb")
    private String packageSnapshot;

    @Column(name = "billing_period_months", nullable = false)
    private Integer billingPeriodMonths = 1;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "INR";

    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod; // MANUAL_UPI, BANK_TRANSFER, GATEWAY, DESK

    @Column(name = "payment_reference", length = 255)
    private String paymentReference;

    @Column(name = "payment_proof_url", columnDefinition = "TEXT")
    private String paymentProofUrl;

    @Column(name = "payment_status", nullable = false, length = 50)
    private String paymentStatus = "PENDING"; // PENDING, VERIFIED, FAILED

    @Column(name = "request_status", nullable = false, length = 50)
    private String requestStatus = "PENDING"; // PENDING, UNDER_REVIEW, APPROVED, REJECTED

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "reviewed_by_admin_id")
    private Long reviewedByAdminId;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "activated_subscription_id")
    private Long activatedSubscriptionId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public PlatformSubscriptionRequest() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.requestUuid == null) {
            this.requestUuid = UUID.randomUUID();
        }
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public UUID getRequestUuid() {
        return requestUuid;
    }

    public void setRequestUuid(UUID requestUuid) {
        this.requestUuid = requestUuid;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(UUID userUuid) {
        this.userUuid = userUuid;
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

    public String getPackageSnapshot() {
        return packageSnapshot;
    }

    public void setPackageSnapshot(String packageSnapshot) {
        this.packageSnapshot = packageSnapshot;
    }

    public Integer getBillingPeriodMonths() {
        return billingPeriodMonths;
    }

    public void setBillingPeriodMonths(Integer billingPeriodMonths) {
        this.billingPeriodMonths = billingPeriodMonths;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public String getPaymentProofUrl() {
        return paymentProofUrl;
    }

    public void setPaymentProofUrl(String paymentProofUrl) {
        this.paymentProofUrl = paymentProofUrl;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getRequestStatus() {
        return requestStatus;
    }

    public void setRequestStatus(String requestStatus) {
        this.requestStatus = requestStatus;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Long getReviewedByAdminId() {
        return reviewedByAdminId;
    }

    public void setReviewedByAdminId(Long reviewedByAdminId) {
        this.reviewedByAdminId = reviewedByAdminId;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public Long getActivatedSubscriptionId() {
        return activatedSubscriptionId;
    }

    public void setActivatedSubscriptionId(Long activatedSubscriptionId) {
        this.activatedSubscriptionId = activatedSubscriptionId;
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
}
