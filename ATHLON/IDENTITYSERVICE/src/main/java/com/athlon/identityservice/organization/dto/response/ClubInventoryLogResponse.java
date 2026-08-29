package com.athlon.identityservice.organization.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public class ClubInventoryLogResponse {

    private Long logId;
    private UUID logUuid;
    private Long itemId;
    private UUID itemUuid;
    private String itemName;
    private String itemCategory;
    private Long organizationId;
    private UUID organizationUuid;
    private String changeType; // RESTOCK, CONSUMED, ADJUSTMENT, DAMAGED
    private Integer quantityChange;
    private Integer quantityAfter;
    private UUID memberUuid;
    private String memberName;
    private String notes;
    private Long loggedBy;
    private LocalDateTime createdAt;

    public ClubInventoryLogResponse() {
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

    public UUID getMemberUuid() {
        return memberUuid;
    }

    public void setMemberUuid(UUID memberUuid) {
        this.memberUuid = memberUuid;
    }

    public String getMemberName() {
        return memberName;
    }

    public void setMemberName(String memberName) {
        this.memberName = memberName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getLoggedBy() {
        return loggedBy;
    }

    public void setLoggedBy(Long loggedBy) {
        this.loggedBy = loggedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
