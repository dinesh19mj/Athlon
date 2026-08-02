package com.athlon.identityservice.config;

import com.athlon.identityservice.subscription.entity.SubscriptionPackage;
import com.athlon.identityservice.subscription.repository.SubscriptionPackageRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(SubscriptionPackageRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.saveAll(List.of(
                        new SubscriptionPackage("Tournament Organizer", 
                                "The ultimate multi-sport experience for hosting tournaments, managing brackets, and live broadcasting.", 
                                new BigDecimal("1200"), 1, 
                                "[\"Multi-Sport Organizing\", \"Advanced Bracket Generation\", \"Umpiring Interface\", \"Live YouTube Streaming\"]"),
                        new SubscriptionPackage("Academy Hub", 
                                "End-to-end management for sports academies, student rosters, coaches, and training schedules.", 
                                new BigDecimal("7900"), 1, 
                                "[\"Student Roster & Profiles\", \"Billing & Invoicing\", \"Coach Assignments\", \"Performance Tracking\"]"),
                        new SubscriptionPackage("Club Management", 
                                "Run your local sports club efficiently with member management and facility booking.", 
                                new BigDecimal("6300"), 1, 
                                "[\"Member Directory\", \"Facility Booking\", \"Internal Club Tournaments\", \"Financial Analytics\"]"),
                        new SubscriptionPackage("Court Provider", 
                                "List your courts for booking, manage availability, and handle payments.", 
                                new BigDecimal("3100"), 1, 
                                "[\"Dynamic Court Scheduling\", \"Payment Processing\", \"Player Reviews\", \"Booking Analytics\"]")
                ));
            }
        };
    }
}
