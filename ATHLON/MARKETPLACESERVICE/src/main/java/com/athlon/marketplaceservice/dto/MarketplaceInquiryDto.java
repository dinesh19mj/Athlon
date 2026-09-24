package com.athlon.marketplaceservice.dto;

import com.athlon.marketplaceservice.entity.MarketplaceInquiry;

import java.time.LocalDateTime;

public class MarketplaceInquiryDto {

    private Long id;
    private Long productId;
    private String productTitle;
    private String buyerUserId;
    private String buyerName;
    private String sellerUserId;
    private String message;
    private String reply;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MarketplaceInquiryDto() {}

    public static MarketplaceInquiryDto fromEntity(MarketplaceInquiry i) {
        if (i == null) return null;
        MarketplaceInquiryDto dto = new MarketplaceInquiryDto();
        dto.setId(i.getId());
        dto.setProductId(i.getProductId());
        dto.setProductTitle(i.getProductTitle());
        dto.setBuyerUserId(i.getBuyerUserId());
        dto.setBuyerName(i.getBuyerName());
        dto.setSellerUserId(i.getSellerUserId());
        dto.setMessage(i.getMessage());
        dto.setReply(i.getReply());
        dto.setStatus(i.getStatus());
        dto.setCreatedAt(i.getCreatedAt());
        dto.setUpdatedAt(i.getUpdatedAt());
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

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
