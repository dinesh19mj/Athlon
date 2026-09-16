package com.athlon.identityservice.organization.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonSetter;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpdateOrganizerInventoryRequest {

    @NotNull(message = "Item UUID is required")
    private UUID itemUuid;

    private UUID tournamentUuid;

    private String itemName;

    private String category;

    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @Min(value = 0, message = "Minimum threshold cannot be negative")
    private Integer minThreshold;

    private String unit;

    private String location;

    private BigDecimal unitCost;

    private String status;

    private String conditionStatus;

    private Boolean isRental;

    private LocalDate returnDueDate;

    private String imageUrl;

    private String notes;

    public UpdateOrganizerInventoryRequest() {
    }

    public UUID getItemUuid() {
        return itemUuid;
    }

    @JsonSetter("itemUuid")
    public void setItemUuid(Object itemUuidObj) {
        if (itemUuidObj == null) {
            this.itemUuid = null;
        } else if (itemUuidObj instanceof UUID) {
            this.itemUuid = (UUID) itemUuidObj;
        } else {
            String str = itemUuidObj.toString().trim();
            if (str.isEmpty() || "null".equalsIgnoreCase(str) || "undefined".equalsIgnoreCase(str)) {
                this.itemUuid = null;
            } else {
                try {
                    this.itemUuid = UUID.fromString(str);
                } catch (IllegalArgumentException e) {
                    this.itemUuid = null;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
