package com.athlon.marketplaceservice.config;

import com.athlon.marketplaceservice.entity.MarketplaceCategory;
import com.athlon.marketplaceservice.repository.MarketplaceCategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class MarketplaceDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(MarketplaceDataSeeder.class);

    private final MarketplaceCategoryRepository categoryRepository;

    public MarketplaceDataSeeder(MarketplaceCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        try {
            if (categoryRepository.count() == 0) {
                log.info("Seeding standard sports categories for ATHLON Marketplace...");

                List<MarketplaceCategory> categories = Arrays.asList(
                    new MarketplaceCategory("badminton", "Badminton", "Badminton", "Sparkles", 1),
                    new MarketplaceCategory("cricket", "Cricket", "Cricket", "Activity", 2),
                    new MarketplaceCategory("football", "Football", "Football", "ShieldCheck", 3),
                    new MarketplaceCategory("tennis", "Tennis", "Tennis", "Flame", 4),
                    new MarketplaceCategory("volleyball", "Volleyball", "Volleyball", "Layers", 5),
                    new MarketplaceCategory("table-tennis", "Table Tennis", "Table Tennis", "Activity", 6),
                    new MarketplaceCategory("basketball", "Basketball", "Basketball", "Flame", 7),
                    new MarketplaceCategory("fitness", "Gym & Fitness", "Fitness", "TrendingUp", 8)
                );

                categoryRepository.saveAll(categories);
                log.info("Successfully seeded {} sports categories.", categories.size());
            }
        } catch (Exception ex) {
            log.warn("Marketplace data seeder notice: {}", ex.getMessage());
        }
    }
}
