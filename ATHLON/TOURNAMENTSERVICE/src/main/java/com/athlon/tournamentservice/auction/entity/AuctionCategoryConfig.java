package com.athlon.tournamentservice.auction.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "auction_category_configs")
public class AuctionCategoryConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "config_id", updatable = false, nullable = false)
    private Long configId;

    @Column(name = "auction_id", nullable = false)
    private Long auctionId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "category_name", nullable = false)
    private String categoryName;

    @Column(name = "category_base_price", nullable = false)
    private Double categoryBasePrice = 1000.0;

    @Column(name = "min_bid_increment")
    private Double minBidIncrement = 500.0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public AuctionCategoryConfig() {}

    public Long getConfigId() {
        return configId;
    }

    public void setConfigId(Long configId) {
        this.configId = configId;
    }

    public Long getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
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

    public Double getCategoryBasePrice() {
        return categoryBasePrice;
    }

    public void setCategoryBasePrice(Double categoryBasePrice) {
        this.categoryBasePrice = categoryBasePrice;
    }

    public Double getMinBidIncrement() {
        return minBidIncrement;
    }

    public void setMinBidIncrement(Double minBidIncrement) {
        this.minBidIncrement = minBidIncrement;
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
