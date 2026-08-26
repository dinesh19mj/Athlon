package com.athlon.tournamentservice.auction.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "auction_teams")
public class AuctionTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "auction_team_id", updatable = false, nullable = false)
    private Long auctionTeamId;

    @Column(name = "auction_id", nullable = false)
    private Long auctionId;

    @Column(name = "auction_uuid", nullable = false)
    private UUID auctionUuid;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "team_uuid", nullable = false)
    private UUID teamUuid;

    @Column(name = "team_name", nullable = false)
    private String teamName;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "initial_budget", nullable = false)
    private Double initialBudget = 50000.0;

    @Column(name = "spent_budget", nullable = false)
    private Double spentBudget = 0.0;

    @Column(name = "remaining_budget", nullable = false)
    private Double remainingBudget = 50000.0;

    @Column(name = "players_acquired_count")
    private Integer playersAcquiredCount = 0;

    @Column(name = "reserved_slots_count")
    private Integer reservedSlotsCount = 0;

    @Column(name = "squad_capacity")
    private Integer squadCapacity = 12;

    @Column(name = "is_eligible")
    private Boolean isEligible = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.initialBudget == null) this.initialBudget = 50000.0;
        if (this.spentBudget == null) this.spentBudget = 0.0;
        if (this.remainingBudget == null) this.remainingBudget = this.initialBudget;
        if (this.playersAcquiredCount == null) this.playersAcquiredCount = 0;
        if (this.reservedSlotsCount == null) this.reservedSlotsCount = 0;
        if (this.squadCapacity == null) this.squadCapacity = 12;
        if (this.isEligible == null) this.isEligible = true;
    }

    public AuctionTeam() {}

    public Long getAuctionTeamId() {
        return auctionTeamId;
    }

    public void setAuctionTeamId(Long auctionTeamId) {
        this.auctionTeamId = auctionTeamId;
    }

    public Long getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public UUID getAuctionUuid() {
        return auctionUuid;
    }

    public void setAuctionUuid(UUID auctionUuid) {
        this.auctionUuid = auctionUuid;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public UUID getTeamUuid() {
        return teamUuid;
    }

    public void setTeamUuid(UUID teamUuid) {
        this.teamUuid = teamUuid;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public Double getInitialBudget() {
        return initialBudget;
    }

    public void setInitialBudget(Double initialBudget) {
        this.initialBudget = initialBudget;
    }

    public Double getSpentBudget() {
        return spentBudget;
    }

    public void setSpentBudget(Double spentBudget) {
        this.spentBudget = spentBudget;
    }

    public Double getRemainingBudget() {
        return remainingBudget;
    }

    public void setRemainingBudget(Double remainingBudget) {
        this.remainingBudget = remainingBudget;
    }

    public Integer getPlayersAcquiredCount() {
        return playersAcquiredCount;
    }

    public void setPlayersAcquiredCount(Integer playersAcquiredCount) {
        this.playersAcquiredCount = playersAcquiredCount;
    }

    public Integer getReservedSlotsCount() {
        return reservedSlotsCount;
    }

    public void setReservedSlotsCount(Integer reservedSlotsCount) {
        this.reservedSlotsCount = reservedSlotsCount;
    }

    public Integer getSquadCapacity() {
        return squadCapacity;
    }

    public void setSquadCapacity(Integer squadCapacity) {
        this.squadCapacity = squadCapacity;
    }

    public Boolean getIsEligible() {
        return isEligible;
    }

    public void setIsEligible(Boolean eligible) {
        isEligible = eligible;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
