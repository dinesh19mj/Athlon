package com.athlon.marketplaceservice.service;

import com.athlon.marketplaceservice.dto.MarketplaceOfferDto;
import com.athlon.marketplaceservice.dto.MarketplaceOfferRequest;
import com.athlon.marketplaceservice.entity.MarketplaceOffer;
import com.athlon.marketplaceservice.entity.MarketplaceProduct;
import com.athlon.marketplaceservice.repository.MarketplaceOfferRepository;
import com.athlon.marketplaceservice.repository.MarketplaceProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketplaceOfferService {

    private final MarketplaceOfferRepository offerRepository;
    private final MarketplaceProductRepository productRepository;

    public MarketplaceOfferService(MarketplaceOfferRepository offerRepository,
                                  MarketplaceProductRepository productRepository) {
        this.offerRepository = offerRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public MarketplaceOfferDto createOffer(MarketplaceOfferRequest req, String buyerUserId, String buyerName) {
        MarketplaceProduct product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + req.getProductId()));

        String buyerId = req.getBuyerUserId() != null ? req.getBuyerUserId() : buyerUserId;
        String bName = req.getBuyerName() != null ? req.getBuyerName() : buyerName;

        MarketplaceOffer offer = new MarketplaceOffer();
        offer.setProductId(product.getId());
        offer.setProductTitle(product.getTitle());
        offer.setBuyerUserId(buyerId != null ? buyerId : "guest_athlete");
        offer.setBuyerName(bName != null ? bName : "Athlon Member");
        offer.setSellerUserId(product.getSellerId());
        offer.setOfferAmount(req.getOfferAmount());
        offer.setOriginalPrice(product.getPrice());
        offer.setMessage(req.getMessage());
        offer.setStatus("PENDING");

        MarketplaceOffer saved = offerRepository.save(offer);
        return MarketplaceOfferDto.fromEntity(saved);
    }

    @Transactional
    public MarketplaceOfferDto respondToOffer(Long offerId, String status, BigDecimal counterAmount, String sellerUserId) {
        MarketplaceOffer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found: " + offerId));

        if (sellerUserId != null && !sellerUserId.equals(offer.getSellerUserId())) {
            throw new SecurityException("Unauthorized to respond to this offer");
        }

        offer.setStatus(status.toUpperCase());
        if (counterAmount != null) {
            offer.setCounterAmount(counterAmount);
        }

        MarketplaceOffer updated = offerRepository.save(offer);
        return MarketplaceOfferDto.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<MarketplaceOfferDto> getOffersForProduct(Long productId) {
        return offerRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(MarketplaceOfferDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MarketplaceOfferDto> getOffersForSeller(String sellerUserId) {
        return offerRepository.findBySellerUserIdOrderByCreatedAtDesc(sellerUserId).stream()
                .map(MarketplaceOfferDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MarketplaceOfferDto> getOffersForBuyer(String buyerUserId) {
        return offerRepository.findByBuyerUserIdOrderByCreatedAtDesc(buyerUserId).stream()
                .map(MarketplaceOfferDto::fromEntity)
                .collect(Collectors.toList());
    }
}
