package com.athlon.identityservice.dto.response;
import com.athlon.identityservice.subscription.dto.response.SubscriptionPackageResponse;

import java.time.LocalDateTime;
import java.util.UUID;

public class OrganizationSubscriptionResponse {

    private UUID uuid;
    private Long organizationId;
    private SubscriptionPackageResponse subscriptionPackage;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private String paymentReference;

    public OrganizationSubscriptionResponse() {
    }

    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }

    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }

    public SubscriptionPackageResponse getSubscriptionPackage() { return subscriptionPackage; }
    public void setSubscriptionPackage(SubscriptionPackageResponse subscriptionPackage) { this.subscriptionPackage = subscriptionPackage; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
}
