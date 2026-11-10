package com.athlon.identityservice.subscription.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tournament_credit_allocations", indexes = {
        @Index(name = "idx_credit_alloc_tournament_uuid", columnList = "tournament_uuid", unique = true),
        @Index(name = "idx_credit_alloc_org_id", columnList = "organization_id")
})
public class TournamentCreditAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "allocation_id", updatable = false, nullable = false)
    private Long allocationId;

    @Column(name = "tournament_uuid", nullable = false, unique = true, length = 64)
    private String tournamentUuid;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(name = "account_id", nullable = false)
    private Long accountId;

    @Column(name = "plan_code", nullable = false, length = 64)
    private String planCode;

    @Column(name = "plan_version", nullable = false)
    private Integer planVersion = 1;

    @Column(name = "max_participants", nullable = false)
    private Integer maxParticipants;

    @Column(name = "max_categories", nullable = false)
    private Integer maxCategories;

    @Column(name = "max_officials", nullable = false)
    private Integer maxOfficials;

    @Column(name = "max_courts", nullable = false)
    private Integer maxCourts;

    @Column(name = "auction_allowed", nullable = false)
    private Boolean auctionAllowed = false;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "CONSUMED"; // RESERVED, CONSUMED, REFUNDED

    @CreationTimestamp
    @Column(name = "allocated_at", updatable = false)
    private LocalDateTime allocatedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public TournamentCreditAllocation() {
    }

    public TournamentCreditAllocation(String tournamentUuid, Long organizationId, Long accountId,
                                      String planCode, Integer planVersion, Integer maxParticipants,
                                      Integer maxCategories, Integer maxOfficials, Integer maxCourts,
                                      Boolean auctionAllowed) {
        this.tournamentUuid = tournamentUuid;
        this.organizationId = organizationId;
        this.accountId = accountId;
        this.planCode = planCode;
        this.planVersion = planVersion != null ? planVersion : 1;
        this.maxParticipants = maxParticipants;
        this.maxCategories = maxCategories;
        this.maxOfficials = maxOfficials;
        this.maxCourts = maxCourts;
        this.auctionAllowed = auctionAllowed != null && auctionAllowed;
        this.status = "CONSUMED";
    }

    public Long getAllocationId() {
        return allocationId;
    }

    public void setAllocationId(Long allocationId) {
        this.allocationId = allocationId;
    }

    public String getTournamentUuid() {
        return tournamentUuid;
    }

    public void setTournamentUuid(String tournamentUuid) {
        this.tournamentUuid = tournamentUuid;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getPlanCode() {
        return planCode;
    }

    public void setPlanCode(String planCode) {
        this.planCode = planCode;
    }

    public Integer getPlanVersion() {
        return planVersion;
    }

    public void setPlanVersion(Integer planVersion) {
        this.planVersion = planVersion;
    }

    public Integer getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public Integer getMaxCategories() {
        return maxCategories;
    }

    public void setMaxCategories(Integer maxCategories) {
        this.maxCategories = maxCategories;
    }

    public Integer getMaxOfficials() {
        return maxOfficials;
    }

    public void setMaxOfficials(Integer maxOfficials) {
        this.maxOfficials = maxOfficials;
    }

    public Integer getMaxCourts() {
        return maxCourts;
    }

    public void setMaxCourts(Integer maxCourts) {
        this.maxCourts = maxCourts;
    }

    public Boolean getAuctionAllowed() {
        return auctionAllowed;
    }

    public void setAuctionAllowed(Boolean auctionAllowed) {
        this.auctionAllowed = auctionAllowed;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getAllocatedAt() {
        return allocatedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}

