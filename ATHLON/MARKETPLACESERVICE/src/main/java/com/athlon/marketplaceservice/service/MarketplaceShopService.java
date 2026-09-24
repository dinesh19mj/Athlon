package com.athlon.marketplaceservice.service;

import com.athlon.marketplaceservice.dto.MarketplaceShopDto;
import com.athlon.marketplaceservice.entity.MarketplaceSellerProfile;
import com.athlon.marketplaceservice.entity.MarketplaceShop;
import com.athlon.marketplaceservice.repository.MarketplaceSellerProfileRepository;
import com.athlon.marketplaceservice.repository.MarketplaceShopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketplaceShopService {

    private final MarketplaceShopRepository shopRepository;
    private final MarketplaceSellerProfileRepository profileRepository;

    public MarketplaceShopService(MarketplaceShopRepository shopRepository,
                                  MarketplaceSellerProfileRepository profileRepository) {
        this.shopRepository = shopRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional(readOnly = true)
    public MarketplaceShopDto getShopBySlug(String slug) {
        return shopRepository.findBySlug(slug)
                .map(MarketplaceShopDto::fromEntity)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with slug: " + slug));
    }

    @Transactional(readOnly = true)
    public MarketplaceShopDto getShopById(Long id) {
        return shopRepository.findById(id)
                .map(MarketplaceShopDto::fromEntity)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<MarketplaceShopDto> getShopsByOwner(String ownerUserId) {
        return shopRepository.findByOwnerUserId(ownerUserId).stream()
                .map(MarketplaceShopDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public MarketplaceShopDto createShop(MarketplaceShopDto dto, String authenticatedUserId) {
        String ownerId = dto.getOwnerUserId() != null ? dto.getOwnerUserId() : authenticatedUserId;
        if (ownerId == null || ownerId.trim().isEmpty()) {
            throw new IllegalArgumentException("Shop owner ID is required");
        }

        String baseSlug = dto.getSlug() != null && !dto.getSlug().isEmpty() 
                ? dto.getSlug() 
                : dto.getShopName().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        
        String slug = baseSlug;
        int counter = 1;
        while (shopRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        MarketplaceShop shop = new MarketplaceShop();
        shop.setOwnerUserId(ownerId);
        shop.setShopName(dto.getShopName());
        shop.setSlug(slug);
        shop.setDescription(dto.getDescription());
        shop.setLogoUrl(dto.getLogoUrl());
        shop.setBannerUrl(dto.getBannerUrl());
        shop.setAddress(dto.getAddress());
        shop.setCity(dto.getCity());
        shop.setState(dto.getState());
        shop.setContactPhone(dto.getContactPhone());
        shop.setContactEmail(dto.getContactEmail());
        shop.setIsVerified(true);
        shop.setStatus("ACTIVE");

        MarketplaceShop saved = shopRepository.save(shop);

        // Also activate shop seller profile
        MarketplaceSellerProfile profile = profileRepository.findByUserId(ownerId)
                .orElseGet(() -> {
                    MarketplaceSellerProfile p = new MarketplaceSellerProfile();
                    p.setUserId(ownerId);
                    return p;
                });
        profile.setSellerType("VERIFIED_SHOP");
        profile.setIsSubscriptionActive(true);
        profile.setSubscriptionTier("SHOP_PRO");
        profile.setCommissionRatePercent(BigDecimal.valueOf(3.0));
        profile.setSubscriptionExpiresAt(LocalDateTime.now().plusYears(1));
        profileRepository.save(profile);

        return MarketplaceShopDto.fromEntity(saved);
    }

    @Transactional
    public MarketplaceShopDto updateShop(Long shopId, MarketplaceShopDto dto, String authenticatedUserId) {
        MarketplaceShop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with ID: " + shopId));

        if (authenticatedUserId != null && !authenticatedUserId.equals(shop.getOwnerUserId())) {
            throw new SecurityException("Unauthorized to modify this shop");
        }

        if (dto.getShopName() != null) shop.setShopName(dto.getShopName());
        if (dto.getDescription() != null) shop.setDescription(dto.getDescription());
        if (dto.getLogoUrl() != null) shop.setLogoUrl(dto.getLogoUrl());
        if (dto.getBannerUrl() != null) shop.setBannerUrl(dto.getBannerUrl());
        if (dto.getAddress() != null) shop.setAddress(dto.getAddress());
        if (dto.getCity() != null) shop.setCity(dto.getCity());
        if (dto.getState() != null) shop.setState(dto.getState());
        if (dto.getContactPhone() != null) shop.setContactPhone(dto.getContactPhone());
        if (dto.getContactEmail() != null) shop.setContactEmail(dto.getContactEmail());

        MarketplaceShop updated = shopRepository.save(shop);
        return MarketplaceShopDto.fromEntity(updated);
    }
}
