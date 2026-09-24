package com.athlon.marketplaceservice.dto;

import com.athlon.marketplaceservice.entity.MarketplaceOffer;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MarketplaceOfferRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Offer amount is required")
    @DecimalMin(value = "1.00", message = "Offer must be at least 1.00")
    private BigDecimal offerAmount;

    private String message;

    private String buyerUserId;
    private String buyerName;

    // Getters and Setters
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public BigDecimal getOfferAmount() { return offerAmount; }
    public void setOfferAmount(BigDecimal offerAmount) { this.offerAmount = offerAmount; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getBuyerUserId() { return buyerUserId; }
    public void setBuyerUserId(String buyerUserId) { this.buyerUserId = buyerUserId; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
}
