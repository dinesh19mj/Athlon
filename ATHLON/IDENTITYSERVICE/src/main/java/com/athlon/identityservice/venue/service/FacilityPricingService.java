package com.athlon.identityservice.venue.service;

import com.athlon.identityservice.venue.entity.FacilityPricingRule;
import com.athlon.identityservice.venue.enums.PricingType;
import com.athlon.identityservice.venue.repository.FacilityPricingRuleRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class FacilityPricingService {

    private final FacilityPricingRuleRepository pricingRuleRepository;

    public FacilityPricingService(FacilityPricingRuleRepository pricingRuleRepository) {
        this.pricingRuleRepository = pricingRuleRepository;
    }

    public static class PriceCalculationResult {
        private final BigDecimal price;
        private final PricingType pricingType;

        public PriceCalculationResult(BigDecimal price, PricingType pricingType) {
            this.price = price;
            this.pricingType = pricingType;
        }

        public BigDecimal getPrice() { return price; }
        public PricingType getPricingType() { return pricingType; }
    }

    /**
     * Calculate price for a facility on a specific date and time interval
     */
    public PriceCalculationResult calculatePrice(Long facilityId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<FacilityPricingRule> activeRules = pricingRuleRepository.findByFacilityIdAndIsActiveTrueOrderByPriorityDesc(facilityId);

        DayOfWeek dow = date.getDayOfWeek();
        boolean isWeekend = (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY);

        long durationMinutes = java.time.Duration.between(startTime, endTime).toMinutes();
        if (durationMinutes <= 0) {
            durationMinutes = 60;
        }

        // 1. Check specific matching rules (priority ordered)
        for (FacilityPricingRule rule : activeRules) {
            // Check date bounds if configured
            if (rule.getEffectiveFrom() != null && date.isBefore(rule.getEffectiveFrom())) continue;
            if (rule.getEffectiveTo() != null && date.isAfter(rule.getEffectiveTo())) continue;

            // Check day of week
            if (rule.getDayOfWeek() != null) {
                if (rule.getPricingType() == PricingType.WEEKEND && !isWeekend) continue;
                if (rule.getDayOfWeek() != dow && rule.getPricingType() != PricingType.WEEKEND) continue;
            } else if (rule.getPricingType() == PricingType.WEEKEND && !isWeekend) {
                continue;
            }

            // Check time overlap
            if (rule.getStartTime() != null && rule.getEndTime() != null) {
                if (startTime.isBefore(rule.getEndTime()) && endTime.isAfter(rule.getStartTime())) {
                    BigDecimal basePrice = rule.getPrice();
                    int ruleDuration = rule.getDurationMinutes() != null && rule.getDurationMinutes() > 0 ? rule.getDurationMinutes() : 60;
                    BigDecimal calculated = basePrice.multiply(BigDecimal.valueOf(durationMinutes))
                            .divide(BigDecimal.valueOf(ruleDuration), 2, RoundingMode.HALF_UP);
                    return new PriceCalculationResult(calculated, rule.getPricingType());
                }
            }
        }

        // 2. Fallback to STANDARD rule if present
        for (FacilityPricingRule rule : activeRules) {
            if (rule.getPricingType() == PricingType.STANDARD) {
                BigDecimal basePrice = rule.getPrice();
                int ruleDuration = rule.getDurationMinutes() != null && rule.getDurationMinutes() > 0 ? rule.getDurationMinutes() : 60;
                BigDecimal calculated = basePrice.multiply(BigDecimal.valueOf(durationMinutes))
                        .divide(BigDecimal.valueOf(ruleDuration), 2, RoundingMode.HALF_UP);
                return new PriceCalculationResult(calculated, PricingType.STANDARD);
            }
        }

        // Default standard price if no rules set up yet (e.g. 500 per hour default)
        BigDecimal defaultPrice = BigDecimal.valueOf(500.00).multiply(BigDecimal.valueOf(durationMinutes))
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        return new PriceCalculationResult(defaultPrice, PricingType.STANDARD);
    }
}
