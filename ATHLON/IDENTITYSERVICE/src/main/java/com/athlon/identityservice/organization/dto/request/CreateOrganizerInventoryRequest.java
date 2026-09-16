package com.athlon.identityservice.organization.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonSetter;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateOrganizerInventoryRequest {

    @NotNull(message = "Organization UUID is required")
    private UUID organizationUuid;

    private UUID tournamentUuid;

    @NotBlank(message = "Item name is required")
    private String itemName;

    @NotBlank(message = "Category is required")
    private String category; // MATCH_GEAR, TROPHIES_AWARDS, PLAYER_KITS, COURT_ASSETS, BRANDING_MEDIA, FIRST_AID_SAFETY, OTHER

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @Min(value = 0, message = "Minimum threshold cannot be negative")
    private Integer minThreshold = 5;

    private String unit = "Units";

    private String location;

    private BigDecimal unitCost;

    private String conditionStatus = "NEW";

    private Boolean isRental = false;

    private LocalDate returnDueDate;

    private String imageUrl;

    private String notes;

    public CreateOrganizerInventoryRequest() {
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    @JsonSetter("organizationUuid")
    public void setOrganizationUuid(Object orgUuidObj) {
        if (orgUuidObj == null) {
            this.organizationUuid = null;
        } else if (orgUuidObj instanceof UUID) {
            this.organizationUuid = (UUID) orgUuidObj;
        } else {
            String str = orgUuidObj.toString().trim();
            if (str.isEmpty() || "null".equalsIgnoreCase(str) || "undefined".equalsIgnoreCase(str)) {
                this.organizationUuid = null;
            } else {
                try {
                    this.organizationUuid = UUID.fromString(str);
                } catch (IllegalArgumentException e) {
                    this.organizationUuid = null;
                }
            }
        }
    }

    public UUID getTournamentUuid() {
        return tournamentUuid;
    }

    @JsonSetter("tournamentUuid")
    public void setTournamentUuid(Object tourObj) {
        if (tourObj == null) {
            this.tournamentUuid = null;
        } else if (tourObj instanceof UUID) {
            this.tournamentUuid = (UUID) tourObj;
        } else {
            String str = tourObj.toString().trim();
            if (str.isEmpty() || "null".equalsIgnoreCase(str) || "undefined".equalsIgnoreCase(str)) {
                this.tournamentUuid = null;
            } else {
                try {
                    this.tournamentUuid = UUID.fromString(str);
                } catch (IllegalArgumentException e) {
                    this.tournamentUuid = null;
                }
            }
        }
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getMinThreshold() {
        return minThreshold;
    }

    public void setMinThreshold(Integer minThreshold) {
        this.minThreshold = minThreshold;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(BigDecimal unitCost) {
        this.unitCost = unitCost;
    }

    public String getConditionStatus() {
        return conditionStatus;
    }

    public void setConditionStatus(String conditionStatus) {
        this.conditionStatus = conditionStatus;
    }

    public Boolean getIsRental() {
        return isRental;
    }

    public void setIsRental(Boolean isRental) {
        this.isRental = isRental;
    }

    public LocalDate getReturnDueDate() {
        return returnDueDate;
    }

    public void setReturnDueDate(LocalDate returnDueDate) {
        this.returnDueDate = returnDueDate;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
