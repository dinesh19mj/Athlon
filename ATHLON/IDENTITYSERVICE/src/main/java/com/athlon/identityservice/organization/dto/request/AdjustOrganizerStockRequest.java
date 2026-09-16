package com.athlon.identityservice.organization.dto.request;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonSetter;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AdjustOrganizerStockRequest {

    @NotNull(message = "Item UUID is required")
    private UUID itemUuid;

    @NotBlank(message = "Change type is required")
    private String changeType; // RESTOCK, CONSUMED_MATCH, ALLOCATED_TO_COURT, DISTRIBUTED_TO_TEAM, DAMAGED_LOST, RETURNED, ADJUSTMENT

    @NotNull(message = "Quantity change is required")
    @Min(value = 1, message = "Quantity change must be at least 1")
    private Integer quantityChange;

    private UUID tournamentUuid;

    private String courtNumber;

    private String recipientName;

    private UUID memberUuid;

    private String notes;

    public AdjustOrganizerStockRequest() {
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

    public String getCourtNumber() {
        return courtNumber;
    }

    public void setCourtNumber(String courtNumber) {
        this.courtNumber = courtNumber;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public UUID getMemberUuid() {
        return memberUuid;
    }

    @JsonSetter("memberUuid")
    public void setMemberUuid(Object memObj) {
        if (memObj == null) {
            this.memberUuid = null;
        } else if (memObj instanceof UUID) {
            this.memberUuid = (UUID) memObj;
        } else {
            String str = memObj.toString().trim();
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
