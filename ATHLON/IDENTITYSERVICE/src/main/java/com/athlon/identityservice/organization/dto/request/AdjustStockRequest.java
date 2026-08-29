package com.athlon.identityservice.organization.dto.request;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonSetter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AdjustStockRequest {

    @NotNull(message = "Item UUID is required")
    private UUID itemUuid;

    @NotBlank(message = "Change type is required (RESTOCK, CONSUMED, ADJUSTMENT, DAMAGED)")
    private String changeType; // RESTOCK, CONSUMED, ADJUSTMENT, DAMAGED

    @NotNull(message = "Quantity change is required")
    private Integer quantityChange; // +10, -2, etc.

    private UUID memberUuid; // Optional athlete or coach who received/used the gear

    private String notes;

    public AdjustStockRequest() {
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

    public String getChangeType() {
        return changeType;
    }

    public void setChangeType(String changeType) {
        this.changeType = changeType;
    }

    public Integer getQuantityChange() {
        return quantityChange;
    }

    public void setQuantityChange(Integer quantityChange) {
        this.quantityChange = quantityChange;
    }

    public UUID getMemberUuid() {
        return memberUuid;
    }

    @JsonSetter("memberUuid")
    public void setMemberUuid(Object memberUuidObj) {
        if (memberUuidObj == null) {
            this.memberUuid = null;
        } else if (memberUuidObj instanceof UUID) {
            this.memberUuid = (UUID) memberUuidObj;
        } else {
            String str = memberUuidObj.toString().trim();
            if (str.isEmpty() || "null".equalsIgnoreCase(str) || "undefined".equalsIgnoreCase(str)) {
                this.memberUuid = null;
            } else {
                try {
                    this.memberUuid = UUID.fromString(str);
                } catch (IllegalArgumentException e) {
                    this.memberUuid = null;
                }
            }
        }
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
