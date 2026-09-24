package com.athlon.marketplaceservice.dto;

import com.athlon.marketplaceservice.entity.MarketplaceOrder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MarketplaceOrderDto {

    private Long id;
    private String orderNumber;
    private Long productId;
    private String productTitle;
    private String productImage;
    private String buyerUserId;
    private String buyerName;
    private String buyerPhone;
    private String sellerUserId;
    private String sellerName;
    private Long shopId;
    private BigDecimal itemPrice;
    private BigDecimal shippingFee;
    private BigDecimal commissionAmount;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String orderStatus;
    private String shippingAddress;
    private String trackingNumber;
    private LocalDateTime createdAt;

    public MarketplaceOrderDto() {}

    public static MarketplaceOrderDto fromEntity(MarketplaceOrder o) {
        if (o == null) return null;
        MarketplaceOrderDto dto = new MarketplaceOrderDto();
        dto.setId(o.getId());
        dto.setOrderNumber(o.getOrderNumber());
        dto.setProductId(o.getProductId());
        dto.setProductTitle(o.getProductTitle());
        dto.setProductImage(o.getProductImage());
        dto.setBuyerUserId(o.getBuyerUserId());
        dto.setBuyerName(o.getBuyerName());
        dto.setBuyerPhone(o.getBuyerPhone());
        dto.setSellerUserId(o.getSellerUserId());
        dto.setSellerName(o.getSellerName());
        dto.setShopId(o.getShopId());
        dto.setItemPrice(o.getItemPrice());
        dto.setShippingFee(o.getShippingFee());
        dto.setCommissionAmount(o.getCommissionAmount());
        dto.setTotalAmount(o.getTotalAmount());
        dto.setPaymentMethod(o.getPaymentMethod());
        dto.setPaymentStatus(o.getPaymentStatus());
        dto.setOrderStatus(o.getOrderStatus());
        dto.setShippingAddress(o.getShippingAddress());
        dto.setTrackingNumber(o.getTrackingNumber());
        dto.setCreatedAt(o.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }

    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }

    public String getBuyerUserId() { return buyerUserId; }
    public void setBuyerUserId(String buyerUserId) { this.buyerUserId = buyerUserId; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public String getBuyerPhone() { return buyerPhone; }
    public void setBuyerPhone(String buyerPhone) { this.buyerPhone = buyerPhone; }

    public String getSellerUserId() { return sellerUserId; }
    public void setSellerUserId(String sellerUserId) { this.sellerUserId = sellerUserId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public Long getShopId() { return shopId; }
    public void setShopId(Long shopId) { this.shopId = shopId; }

    public BigDecimal getItemPrice() { return itemPrice; }
    public void setItemPrice(BigDecimal itemPrice) { this.itemPrice = itemPrice; }

    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal shippingFee) { this.shippingFee = shippingFee; }

    public BigDecimal getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(BigDecimal commissionAmount) { this.commissionAmount = commissionAmount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
