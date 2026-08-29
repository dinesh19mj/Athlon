package com.athlon.identityservice.organization.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "club_inventory_logs")
public class ClubInventoryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id", updatable = false, nullable = false)
    private Long logId;

    @Column(name = "log_uuid", updatable = false, nullable = false, unique = true)
    private UUID logUuid;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "item_uuid", nullable = false)
    private UUID itemUuid;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(name = "organization_uuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "change_type", nullable = false, length = 30)
    private String changeType; // RESTOCK, CONSUMED, ADJUSTMENT, DAMAGED

    @Column(name = "quantity_change", nullable = false)
    private Integer quantityChange; // +10, -2

    @Column(name = "quantity_after", nullable = false)
    private Integer quantityAfter;

    @Column(name = "member_uuid")
    private UUID memberUuid; // Optional athlete/coach involved

    @Column(name = "notes", length = 300)
    private String notes;

    @Column(name = "logged_by")
    private Long loggedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ClubInventoryLog() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.logUuid == null) {
            this.logUuid = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
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
