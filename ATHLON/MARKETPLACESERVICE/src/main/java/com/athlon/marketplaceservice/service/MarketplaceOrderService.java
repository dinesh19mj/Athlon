package com.athlon.marketplaceservice.service;

import com.athlon.marketplaceservice.dto.MarketplaceOrderDto;
import com.athlon.marketplaceservice.dto.MarketplaceOrderRequest;
import com.athlon.marketplaceservice.entity.MarketplaceOrder;
import com.athlon.marketplaceservice.entity.MarketplaceProduct;
import com.athlon.marketplaceservice.repository.MarketplaceOrderRepository;
import com.athlon.marketplaceservice.repository.MarketplaceProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketplaceOrderService {

    private final MarketplaceOrderRepository orderRepository;
    private final MarketplaceProductRepository productRepository;

    public MarketplaceOrderService(MarketplaceOrderRepository orderRepository,
                                  MarketplaceProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public MarketplaceOrderDto createOrder(MarketplaceOrderRequest req, String buyerUserId, String buyerName) {
        MarketplaceProduct product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + req.getProductId()));

        if (!"AVAILABLE".equalsIgnoreCase(product.getStatus())) {
            throw new IllegalStateException("Product is no longer available for purchase. Status: " + product.getStatus());
        }

        BigDecimal price = req.getOfferedPrice() != null ? req.getOfferedPrice() : product.getPrice();
        BigDecimal shippingFee = BigDecimal.valueOf(150.00); // Standard insured sports courier

        // Calculate platform commission (5% individual, 3% shop)
        BigDecimal rate = product.getShopId() != null ? BigDecimal.valueOf(0.03) : BigDecimal.valueOf(0.05);
        BigDecimal commission = price.multiply(rate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = price.add(shippingFee);

        String bUserId = req.getBuyerUserId() != null ? req.getBuyerUserId() : buyerUserId;
        String bName = req.getBuyerName() != null ? req.getBuyerName() : buyerName;

        MarketplaceOrder order = new MarketplaceOrder();
        order.setOrderNumber("MKT-" + System.currentTimeMillis());
        order.setProductId(product.getId());
        order.setProductTitle(product.getTitle());
        order.setProductImage(product.getImages() != null && !product.getImages().isEmpty() ? product.getImages().get(0) : null);
        order.setBuyerUserId(bUserId != null ? bUserId : "guest_athlete");
        order.setBuyerName(bName != null ? bName : "Athlon Member");
        order.setBuyerPhone(req.getBuyerPhone());
        order.setSellerUserId(product.getSellerId());
        order.setSellerName(product.getSellerName());
        order.setShopId(product.getShopId());
        order.setItemPrice(price);
        order.setShippingFee(shippingFee);
        order.setCommissionAmount(commission);
        order.setTotalAmount(total);
        order.setPaymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : "COMMUNITY_ESCROW");
        order.setPaymentStatus("PENDING");
        order.setOrderStatus("CONFIRMED");
        order.setShippingAddress(req.getShippingAddress());

        // Mark product as RESERVED
        product.setStatus("RESERVED");
        productRepository.save(product);

        MarketplaceOrder saved = orderRepository.save(order);
        return MarketplaceOrderDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public MarketplaceOrderDto getOrderById(Long id) {
        return orderRepository.findById(id)
                .map(MarketplaceOrderDto::fromEntity)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public MarketplaceOrderDto getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .map(MarketplaceOrderDto::fromEntity)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with number: " + orderNumber));
    }

    @Transactional(readOnly = true)
    public List<MarketplaceOrderDto> getOrdersForBuyer(String buyerUserId) {
        return orderRepository.findByBuyerUserIdOrderByCreatedAtDesc(buyerUserId).stream()
                .map(MarketplaceOrderDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MarketplaceOrderDto> getOrdersForSeller(String sellerUserId) {
        return orderRepository.findBySellerUserIdOrderByCreatedAtDesc(sellerUserId).stream()
                .map(MarketplaceOrderDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public MarketplaceOrderDto updateOrderStatus(Long orderId, String newStatus, String trackingNumber, String sellerUserId) {
        MarketplaceOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        if (sellerUserId != null && !sellerUserId.equals(order.getSellerUserId())) {
            throw new SecurityException("Unauthorized to update status of this order");
        }

        order.setOrderStatus(newStatus.toUpperCase());
        if (trackingNumber != null && !trackingNumber.trim().isEmpty()) {
            order.setTrackingNumber(trackingNumber.trim());
        }

        if ("DELIVERED".equalsIgnoreCase(newStatus)) {
            order.setPaymentStatus("PAID");
            // Mark item SOLD
            productRepository.findById(order.getProductId()).ifPresent(p -> {
                p.setStatus("SOLD");
                productRepository.save(p);
            });
        }

        MarketplaceOrder updated = orderRepository.save(order);
        return MarketplaceOrderDto.fromEntity(updated);
    }
}
