package com.athlon.marketplaceservice.dto;

import com.athlon.marketplaceservice.entity.MarketplaceOffer;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MarketplaceOfferDto {

    private Long id;
    private Long productId;
    private String productTitle;
    private String buyerUserId;
    private String buyerName;
    private String sellerUserId;
    private BigDecimal offerAmount;
    private BigDecimal originalPrice;
    private String message;
    private BigDecimal counterAmount;
    private String status;
    private LocalDateTime createdAt;

    public MarketplaceOfferDto() {}

    public static MarketplaceOfferDto fromEntity(MarketplaceOffer o) {
        if (o == null) return null;
        MarketplaceOfferDto dto = new MarketplaceOfferDto();
        dto.setId(o.getId());
        dto.setProductId(o.getProductId());
        dto.setProductTitle(o.getProductTitle());
        dto.setBuyerUserId(o.getBuyerUserId());
        dto.setBuyerName(o.getBuyerName());
        dto.setSellerUserId(o.getSellerUserId());
        dto.setOfferAmount(o.getOfferAmount());
        dto.setOriginalPrice(o.getOriginalPrice());
        dto.setMessage(o.getMessage());
        dto.setCounterAmount(o.getCounterAmount());
        dto.setStatus(o.getStatus());
        dto.setCreatedAt(o.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }

    public String getBuyerUserId() { return buyerUserId; }
    public void setBuyerUserId(String buyerUserId) { this.buyerUserId = buyerUserId; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public String getSellerUserId() { return sellerUserId; }
    public void setSellerUserId(String sellerUserId) { this.sellerUserId = sellerUserId; }

    public BigDecimal getOfferAmount() { return offerAmount; }
    public void setOfferAmount(BigDecimal offerAmount) { this.offerAmount = offerAmount; }

    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public BigDecimal getCounterAmount() { return counterAmount; }
    public void setCounterAmount(BigDecimal counterAmount) { this.counterAmount = counterAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
