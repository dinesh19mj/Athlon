package com.athlon.marketplaceservice.config;

import com.athlon.marketplaceservice.entity.MarketplaceCategory;
import com.athlon.marketplaceservice.entity.MarketplaceProduct;
import com.athlon.marketplaceservice.entity.MarketplaceSellerProfile;
import com.athlon.marketplaceservice.entity.MarketplaceShop;
import com.athlon.marketplaceservice.repository.MarketplaceCategoryRepository;
import com.athlon.marketplaceservice.repository.MarketplaceProductRepository;
import com.athlon.marketplaceservice.repository.MarketplaceSellerProfileRepository;
import com.athlon.marketplaceservice.repository.MarketplaceShopRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class MarketplaceDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(MarketplaceDataSeeder.class);

    private final MarketplaceCategoryRepository categoryRepository;
    private final MarketplaceProductRepository productRepository;
    private final MarketplaceShopRepository shopRepository;
    private final MarketplaceSellerProfileRepository sellerProfileRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public MarketplaceDataSeeder(MarketplaceCategoryRepository categoryRepository,
                                 MarketplaceProductRepository productRepository,
                                 MarketplaceShopRepository shopRepository,
                                 MarketplaceSellerProfileRepository sellerProfileRepository,
                                 org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.shopRepository = shopRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            fixLegacyConstraints();
            seedCategories();
            seedShopsAndProducts();
        } catch (Exception e) {
            log.warn("Marketplace data seeder notice: {}", e.getMessage());
        }
    }

    private void fixLegacyConstraints() {
        for (String table : Arrays.asList("marketplace_shops", "marketplace_products", "marketplace_seller_profiles", "marketplace_orders")) {
            try {
                List<String> notNullCols = jdbcTemplate.query(
                    "SELECT column_name FROM information_schema.columns WHERE table_name = ? AND is_nullable = 'NO' AND column_name NOT IN ('id', 'created_at', 'updated_at')",
                    (rs, rowNum) -> rs.getString("column_name"),
                    table
                );
                for (String col : notNullCols) {
                    try {
                        jdbcTemplate.execute("ALTER TABLE " + table + " ALTER COLUMN \"" + col + "\" DROP NOT NULL");
                        log.info("Dropped legacy NOT NULL on {}.{}", table, col);
                    } catch (Exception ignored) {}
                }
            } catch (Exception e) {
                log.warn("Auto-relaxing constraints notice for {}: {}", table, e.getMessage());
            }
        }
    }

    private void seedCategories() {
        try {
            if (categoryRepository.count() > 0) return;

            List<MarketplaceCategory> categories = Arrays.asList(
                    new MarketplaceCategory("all", "All Gear", "All", "Sparkles", 0),
                    new MarketplaceCategory("badminton", "Badminton", "Badminton", "Activity", 1),
                    new MarketplaceCategory("cricket", "Cricket", "Cricket", "ShieldCheck", 2),
                    new MarketplaceCategory("football", "Football", "Football", "Zap", 3),
                    new MarketplaceCategory("tennis", "Tennis", "Tennis", "Award", 4),
                    new MarketplaceCategory("fitness", "Fitness & Gym", "Fitness", "Flame", 5),
                    new MarketplaceCategory("running", "Running & Track", "Running", "TrendingUp", 6)
            );
            categoryRepository.saveAll(categories);
            log.info("Seeded {} marketplace categories.", categories.size());
        } catch (Exception e) {
            log.warn("Category seed warning: {}", e.getMessage());
        }
    }

    private void seedShopsAndProducts() {
        if (productRepository.count() > 0) return;

        MarketplaceShop savedShop = shopRepository.findBySlug("prosmash-sports").orElse(null);
        if (savedShop == null) {
            try {
                // Seed sample verified shop
                MarketplaceShop proSmashShop = new MarketplaceShop();
                proSmashShop.setOwnerUserId("shop_pro_smash_01");
                proSmashShop.setShopName("ProSmash Sports Hub");
                proSmashShop.setSlug("prosmash-sports");
                proSmashShop.setDescription("Certified tournament racket stringing, premier badminton gear, and verified match-grade equipment.");
                proSmashShop.setAddress("42 Stadium Road, Sports Enclave");
                proSmashShop.setCity("Chennai");
                proSmashShop.setState("Tamil Nadu");
                proSmashShop.setContactPhone("+91 98765 43210");
                proSmashShop.setContactEmail("care@prosmash.in");
                proSmashShop.setIsVerified(true);
                proSmashShop.setRating(BigDecimal.valueOf(4.95));
                proSmashShop.setTotalReviews(84);
                proSmashShop.setStatus("ACTIVE");
                savedShop = shopRepository.save(proSmashShop);
            } catch (Exception e) {
                log.warn("Shop seed warning: {}", e.getMessage());
                savedShop = shopRepository.findBySlug("prosmash-sports").orElse(null);
            }
        }

        if (!sellerProfileRepository.findByUserId("shop_pro_smash_01").isPresent()) {
            try {
                // Seed Seller Profile for shop
                MarketplaceSellerProfile shopProfile = new MarketplaceSellerProfile();
                shopProfile.setUserId("shop_pro_smash_01");
                shopProfile.setSellerType("VERIFIED_SHOP");
                shopProfile.setIsSubscriptionActive(true);
                shopProfile.setSubscriptionTier("SHOP_PRO");
                shopProfile.setCommissionRatePercent(BigDecimal.valueOf(3.0));
                shopProfile.setSubscriptionExpiresAt(LocalDateTime.now().plusYears(1));
                shopProfile.setStatus("ACTIVE");
                sellerProfileRepository.save(shopProfile);
            } catch (Exception e) {
                log.warn("Seller profile seed warning: {}", e.getMessage());
            }
        }

        Long shopId = savedShop != null ? savedShop.getId() : null;

        // Product 1: Yonex Astrox 88D Pro
        MarketplaceProduct p1 = new MarketplaceProduct();
        p1.setTitle("Yonex Astrox 88D Pro (3UG5) Strung 28lbs");
        p1.setDescription("Tournament match ready! Strung with BG80 Power at 28lbs. Only used in 2 state ranking tournaments. Original grip intact with Yonex AC102EX overgrip.");
        p1.setSport("Badminton");
        p1.setCategory("Racquets");
        p1.setPrice(BigDecimal.valueOf(11499.00));
        p1.setOriginalPrice(BigDecimal.valueOf(17990.00));
        p1.setCondition("LIKE_NEW");
        p1.setConditionDetails("Single minor scratch on the frame grommet, zero cracks or structural flaws.");
        p1.setBrand("Yonex");
        p1.setModel("Astrox 88D Pro");
        p1.setYearOfPurchase(2025);
        p1.setLocation("Indiranagar, Bengaluru");
        p1.setTags("yonex,astrox,badminton,racket,headheavy");
        p1.setIsVerified(true);
        p1.setVerificationStatus("PRO_VERIFIED");
        p1.setSellerId("shop_pro_smash_01");
        p1.setSellerName("ProSmash Sports Hub");
        p1.setSellerRole("Verified Shop");
        p1.setShopId(shopId);
        p1.setStatus("AVAILABLE");
        p1.setViewsCount(142);
        p1.setWishlistCount(19);
        p1.setImages(Arrays.asList(
                "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=800&auto=format&fit=crop&q=80"
        ));
        productRepository.save(p1);

        // Product 2: SS Ton Matrix English Willow Cricket Bat
        MarketplaceProduct p2 = new MarketplaceProduct();
        p2.setTitle("SS Ton Matrix Grade 1 English Willow Cricket Bat");
        p2.setDescription("Fully knocked in (10,000 mallet strikes), oiled and extratec faced. 8 straight grains with 39mm edges and duckbill profile. Weight 1180g.");
        p2.setSport("Cricket");
        p2.setCategory("Bats");
        p2.setPrice(BigDecimal.valueOf(14500.00));
        p2.setOriginalPrice(BigDecimal.valueOf(22500.00));
        p2.setCondition("EXCELLENT");
        p2.setConditionDetails("Played in 4 club league games. Clean sweet spot with phenomenal ping.");
        p2.setBrand("SS Sunridges");
        p2.setModel("Ton Matrix");
        p2.setYearOfPurchase(2025);
        p2.setLocation("Shivaji Park, Mumbai");
        p2.setTags("cricket,bat,englishwillow,ss,ton");
        p2.setIsVerified(true);
        p2.setVerificationStatus("COMMUNITY_VERIFIED");
        p2.setSellerId("player_rohit_45");
        p2.setSellerName("Rohit Sharma (Athlon Club Player)");
        p2.setSellerRole("Tournament Athlete");
        p2.setStatus("AVAILABLE");
        p2.setViewsCount(89);
        p2.setWishlistCount(12);
        p2.setImages(Arrays.asList(
                "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80"
        ));
        productRepository.save(p2);

        // Product 3: Nike Mercurial Superfly 9 Elite FG
        MarketplaceProduct p3 = new MarketplaceProduct();
        p3.setTitle("Nike Mercurial Superfly 9 Elite FG (UK 9 / US 10)");
        p3.setDescription("Top-tier firm ground football cleats with Zoom Air unit and Vaporposite+ upper. Only worn on natural grass twice.");
        p3.setSport("Football");
        p3.setCategory("Shoes");
        p3.setPrice(BigDecimal.valueOf(9800.00));
        p3.setOriginalPrice(BigDecimal.valueOf(24995.00));
        p3.setCondition("LIKE_NEW");
        p3.setConditionDetails("Studs show negligible wear, insoles in fresh condition, original box included.");
        p3.setBrand("Nike");
        p3.setModel("Mercurial Superfly 9 Elite");
        p3.setYearOfPurchase(2026);
        p3.setLocation("Salt Lake, Kolkata");
        p3.setTags("football,boots,nike,mercurial,elite,fg");
        p3.setIsVerified(false);
        p3.setVerificationStatus("UNVERIFIED");
        p3.setSellerId("player_karthik_11");
        p3.setSellerName("Karthik M (State League Striker)");
        p3.setSellerRole("Individual Seller");
        p3.setStatus("AVAILABLE");
        p3.setViewsCount(64);
        p3.setWishlistCount(8);
        p3.setImages(Arrays.asList(
                "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80"
        ));
        productRepository.save(p3);

        // Product 4: Wilson Pro Staff 97 v14 Tennis Racquet
        MarketplaceProduct p4 = new MarketplaceProduct();
        p4.setTitle("Wilson Pro Staff 97 v14 Tennis Racquet (4 3/8 Grip)");
        p4.setDescription("Legendary precision and control. Strung with Luxilon ALU Power at 52lbs. Perfect for competitive tournament players.");
        p4.setSport("Tennis");
        p4.setCategory("Racquets");
        p4.setPrice(BigDecimal.valueOf(13200.00));
        p4.setOriginalPrice(BigDecimal.valueOf(21990.00));
        p4.setCondition("EXCELLENT");
        p4.setConditionDetails("Minor bumper guard court rash, frame has zero cracks.");
        p4.setBrand("Wilson");
        p4.setModel("Pro Staff 97 v14");
        p4.setYearOfPurchase(2025);
        p4.setLocation("Jubilee Hills, Hyderabad");
        p4.setTags("tennis,wilson,prostaff,racquet,luxilon");
        p4.setIsVerified(true);
        p4.setVerificationStatus("PRO_VERIFIED");
        p4.setSellerId("shop_pro_smash_01");
        p4.setSellerName("ProSmash Sports Hub");
        p4.setSellerRole("Verified Shop");
        p4.setShopId(savedShop.getId());
        p4.setStatus("AVAILABLE");
        p4.setViewsCount(118);
        p4.setWishlistCount(15);
        p4.setImages(Arrays.asList(
                "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop&q=80"
        ));
        productRepository.save(p4);

        log.info("Seeded initial marketplace demo products and verified shop.");
    }
}
