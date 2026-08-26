package com.athlon.tournamentservice.auction.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "auction_reserved_players")
public class AuctionReservedPlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reserved_id", updatable = false, nullable = false)
    private Long reservedId;

    @Column(name = "reserved_uuid", updatable = false, nullable = false, unique = true)
    private UUID reservedUuid;

    @Column(name = "auction_id", nullable = false)
    private Long auctionId;

    @Column(name = "championship_id", nullable = false)
    private Long championshipId;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "player_id", nullable = false)
    private Long playerId;

    @Column(name = "player_name", nullable = false)
    private String playerName;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "is_locked")
    private Boolean isLocked = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.reservedUuid == null) {
            this.reservedUuid = UUID.randomUUID();
        }
        if (this.isLocked == null) this.isLocked = true;
    }

    public AuctionReservedPlayer() {}

    public Long getReservedId() {
        return reservedId;
    }

    public void setReservedId(Long reservedId) {
        this.reservedId = reservedId;
    }

    public UUID getReservedUuid() {
        return reservedUuid;
    }

    public void setReservedUuid(UUID reservedUuid) {
        this.reservedUuid = reservedUuid;
    }

    public Long getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public Long getChampionshipId() {
        return championshipId;
    }

    public void setChampionshipId(Long championshipId) {
        this.championshipId = championshipId;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Boolean getIsLocked() {
        return isLocked;
    }

    public void setIsLocked(Boolean locked) {
        isLocked = locked;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
