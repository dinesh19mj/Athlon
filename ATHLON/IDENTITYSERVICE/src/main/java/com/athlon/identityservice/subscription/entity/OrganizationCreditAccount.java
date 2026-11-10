package com.athlon.identityservice.subscription.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "organization_credit_accounts", indexes = {
        @Index(name = "idx_credit_account_org_id", columnList = "organization_id", unique = true)
})
public class OrganizationCreditAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id", updatable = false, nullable = false)
    private Long accountId;

    @Column(name = "organization_id", nullable = false, unique = true)
    private Long organizationId;

    @Column(name = "tournament_credits_available", nullable = false)
    private Integer tournamentCreditsAvailable = 0;

    @Column(name = "tournament_credits_reserved", nullable = false)
    private Integer tournamentCreditsReserved = 0;

    @Column(name = "auction_credits_available", nullable = false)
    private Integer auctionCreditsAvailable = 0;

    @Column(name = "auction_credits_reserved", nullable = false)
    private Integer auctionCreditsReserved = 0;

    @Column(name = "active_tier_code", nullable = false, length = 64)
    private String activeTierCode = "TOURNAMENT_FREE";

    @Version
    @Column(name = "version")
    private Long version = 0L;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public OrganizationCreditAccount() {
    }

    public OrganizationCreditAccount(Long organizationId, String activeTierCode) {
        this.organizationId = organizationId;
        this.activeTierCode = activeTierCode != null ? activeTierCode : "TOURNAMENT_FREE";
        this.tournamentCreditsAvailable = 0;
        this.tournamentCreditsReserved = 0;
        this.auctionCreditsAvailable = 0;
        this.auctionCreditsReserved = 0;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public Integer getTournamentCreditsAvailable() {
        return tournamentCreditsAvailable;
    }

    public void setTournamentCreditsAvailable(Integer tournamentCreditsAvailable) {
        this.tournamentCreditsAvailable = tournamentCreditsAvailable;
    }

    public Integer getTournamentCreditsReserved() {
        return tournamentCreditsReserved;
    }

    public void setTournamentCreditsReserved(Integer tournamentCreditsReserved) {
        this.tournamentCreditsReserved = tournamentCreditsReserved;
    }

    public Integer getAuctionCreditsAvailable() {
        return auctionCreditsAvailable;
    }

    public void setAuctionCreditsAvailable(Integer auctionCreditsAvailable) {
        this.auctionCreditsAvailable = auctionCreditsAvailable;
    }

    public Integer getAuctionCreditsReserved() {
        return auctionCreditsReserved;
    }

    public void setAuctionCreditsReserved(Integer auctionCreditsReserved) {
        this.auctionCreditsReserved = auctionCreditsReserved;
    }

    public String getActiveTierCode() {
        return activeTierCode;
    }

    public void setActiveTierCode(String activeTierCode) {
        this.activeTierCode = activeTierCode;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}

