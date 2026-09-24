package com.athlon.marketplaceservice.dto;

import com.athlon.marketplaceservice.entity.MarketplaceInquiry;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class MarketplaceInquiryRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Message is required")
    private String message;

    private String buyerUserId;
    private String buyerName;

    // Getters and Setters
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getBuyerUserId() { return buyerUserId; }
    public void setBuyerUserId(String buyerUserId) { this.buyerUserId = buyerUserId; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
}
