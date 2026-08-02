package com.athlon.identityservice.dto.request;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public class SubscribeOrganizationRequest {

    @NotNull(message = "Organization UUID is required")
    private UUID organizationUuid;

    @NotNull(message = "Subscription Package UUID is required")
    private UUID packageUuid;

    private String paymentReference;

    public SubscribeOrganizationRequest() {
    }

    public UUID getOrganizationUuid() { return organizationUuid; }
    public void setOrganizationUuid(UUID organizationUuid) { this.organizationUuid = organizationUuid; }

    public UUID getPackageUuid() { return packageUuid; }
    public void setPackageUuid(UUID packageUuid) { this.packageUuid = packageUuid; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
}
