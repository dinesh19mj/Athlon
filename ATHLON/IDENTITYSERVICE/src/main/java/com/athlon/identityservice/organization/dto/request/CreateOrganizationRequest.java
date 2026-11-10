package com.athlon.identityservice.organization.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateOrganizationRequest {

    @NotBlank(message = "Organization name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    private String description;

    @NotBlank(message = "Organization type is required")
    @Size(max = 100, message = "Type must not exceed 100 characters")
    private String type;

    private String planCode;
    private java.util.UUID planUuid;
    private String billingCycle;

    // Deprecated alias for backwards compatibility
    private java.util.UUID subscriptionPackageUuid;

    public CreateOrganizationRequest() {
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getPlanCode() {
        return planCode;
    }

    public void setPlanCode(String planCode) {
        this.planCode = planCode;
    }

    public java.util.UUID getPlanUuid() {
        return planUuid != null ? planUuid : subscriptionPackageUuid;
    }

    public void setPlanUuid(java.util.UUID planUuid) {
        this.planUuid = planUuid;
        this.subscriptionPackageUuid = planUuid;
    }

    public String getBillingCycle() {
        return billingCycle;
    }

    public void setBillingCycle(String billingCycle) {
        this.billingCycle = billingCycle;
    }

    public java.util.UUID getSubscriptionPackageUuid() {
        return getPlanUuid();
    }

    public void setSubscriptionPackageUuid(java.util.UUID subscriptionPackageUuid) {
        setPlanUuid(subscriptionPackageUuid);
    }
}
