package com.athlon.identityservice.organization.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public class OrganizerInventoryLogResponse {

    private Long logId;
    private UUID logUuid;
    private Long itemId;
    private UUID itemUuid;
    private String itemName;
    private String itemCategory;
    private String unit;
    private Long organizationId;
    private UUID organizationUuid;
    private UUID tournamentUuid;
    private String changeType;
    private Integer quantityChange;
    private Integer quantityAfter;
    private String courtNumber;
    private String recipientName;
    private UUID memberUuid;
    private String loggedByName;
    private String notes;
    private LocalDateTime createdAt;

    public OrganizerInventoryLogResponse() {
    }

    public Long getLogId() {
        return logId;
    }

    public void setLogId(Long logId) {
        this.logId = logId;
    }

    public UUID getLogUuid() {
        return logUuid;
    }

    public void setLogUuid(UUID logUuid) {
        this.logUuid = logUuid;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public UUID getItemUuid() {
        return itemUuid;
    }

    public void setItemUuid(UUID itemUuid) {
        this.itemUuid = itemUuid;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getItemCategory() {
        return itemCategory;
    }

    public void setItemCategory(String itemCategory) {
        this.itemCategory = itemCategory;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
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

    public UUID getTournamentUuid() {
        return tournamentUuid;
    }

    public void setTournamentUuid(UUID tournamentUuid) {
        this.tournamentUuid = tournamentUuid;
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

    public Integer getQuantityAfter() {
        return quantityAfter;
    }

    public void setQuantityAfter(Integer quantityAfter) {
        this.quantityAfter = quantityAfter;
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

    public void setMemberUuid(UUID memberUuid) {
        this.memberUuid = memberUuid;
    }

    public String getLoggedByName() {
        return loggedByName;
    }

    public void setLoggedByName(String loggedByName) {
        this.loggedByName = loggedByName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
