package com.athlon.marketplaceservice.service;

import com.athlon.marketplaceservice.dto.MarketplaceInquiryDto;
import com.athlon.marketplaceservice.dto.MarketplaceInquiryRequest;
import com.athlon.marketplaceservice.entity.MarketplaceInquiry;
import com.athlon.marketplaceservice.entity.MarketplaceProduct;
import com.athlon.marketplaceservice.repository.MarketplaceInquiryRepository;
import com.athlon.marketplaceservice.repository.MarketplaceProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketplaceInquiryService {

    private final MarketplaceInquiryRepository inquiryRepository;
    private final MarketplaceProductRepository productRepository;

    public MarketplaceInquiryService(MarketplaceInquiryRepository inquiryRepository,
                                    MarketplaceProductRepository productRepository) {
        this.inquiryRepository = inquiryRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public MarketplaceInquiryDto createInquiry(MarketplaceInquiryRequest req, String buyerUserId, String buyerName) {
        MarketplaceProduct product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + req.getProductId()));

        String buyerId = req.getBuyerUserId() != null ? req.getBuyerUserId() : buyerUserId;
        String bName = req.getBuyerName() != null ? req.getBuyerName() : buyerName;

        MarketplaceInquiry inquiry = new MarketplaceInquiry();
        inquiry.setProductId(product.getId());
        inquiry.setProductTitle(product.getTitle());
        inquiry.setBuyerUserId(buyerId != null ? buyerId : "guest_athlete");
        inquiry.setBuyerName(bName != null ? bName : "Athlon Athlete");
        inquiry.setSellerUserId(product.getSellerId());
        inquiry.setMessage(req.getMessage());
        inquiry.setStatus("OPEN");

        MarketplaceInquiry saved = inquiryRepository.save(inquiry);
        return MarketplaceInquiryDto.fromEntity(saved);
    }

    @Transactional
    public MarketplaceInquiryDto replyToInquiry(Long inquiryId, String reply, String sellerUserId) {
        MarketplaceInquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("Inquiry not found: " + inquiryId));

        if (sellerUserId != null && !sellerUserId.equals(inquiry.getSellerUserId())) {
            throw new SecurityException("Unauthorized to reply to this inquiry");
        }

        inquiry.setReply(reply);
        inquiry.setStatus("ANSWERED");

        MarketplaceInquiry updated = inquiryRepository.save(inquiry);
        return MarketplaceInquiryDto.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<MarketplaceInquiryDto> getInquiriesForProduct(Long productId) {
        return inquiryRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(MarketplaceInquiryDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MarketplaceInquiryDto> getInquiriesForSeller(String sellerUserId) {
        return inquiryRepository.findBySellerUserIdOrderByCreatedAtDesc(sellerUserId).stream()
                .map(MarketplaceInquiryDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MarketplaceInquiryDto> getInquiriesForBuyer(String buyerUserId) {
        return inquiryRepository.findByBuyerUserIdOrderByCreatedAtDesc(buyerUserId).stream()
                .map(MarketplaceInquiryDto::fromEntity)
                .collect(Collectors.toList());
    }
}
