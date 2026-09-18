package com.athlon.identityservice.venue.entity;

import com.athlon.identityservice.venue.enums.PricingType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "facility_pricing_rules")
public class FacilityPricingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "facility_id", nullable = false)
    private Long facilityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "pricing_type", nullable = false, length = 50)
    private PricingType pricingType = PricingType.STANDARD;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", length = 20)
    private DayOfWeek dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 60;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "priority")
    private Integer priority = 1;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public FacilityPricingRule() {
    }

    public FacilityPricingRule(Long facilityId, PricingType pricingType, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime, BigDecimal price, Integer durationMinutes) {
        this.facilityId = facilityId;
        this.pricingType = pricingType != null ? pricingType : PricingType.STANDARD;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.price = price;
        this.durationMinutes = durationMinutes != null ? durationMinutes : 60;
        this.isActive = true;
        this.priority = pricingType == PricingType.CUSTOM ? 10 : (pricingType == PricingType.PEAK || pricingType == PricingType.WEEKEND ? 5 : 1);
    }

    public FacilityPricingRule(Long facilityId, PricingType pricingType, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime, BigDecimal price, Integer durationMinutes, LocalDate effectiveFrom, LocalDate effectiveTo, Integer priority, Boolean isActive) {
        this.facilityId = facilityId;
        this.pricingType = pricingType != null ? pricingType : PricingType.STANDARD;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.price = price;
        this.durationMinutes = durationMinutes != null ? durationMinutes : 60;
        this.effectiveFrom = effectiveFrom;
        this.effectiveTo = effectiveTo;
        this.priority = priority != null ? priority : 1;
        this.isActive = isActive != null ? isActive : true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFacilityId() {
        return facilityId;
    }

    public void setFacilityId(Long facilityId) {
        this.facilityId = facilityId;
    }

    public PricingType getPricingType() {
        return pricingType;
    }

    public void setPricingType(PricingType pricingType) {
        this.pricingType = pricingType;
    }

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(DayOfWeek dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public LocalDate getEffectiveTo() {
        return effectiveTo;
    }

    public void setEffectiveTo(LocalDate effectiveTo) {
        this.effectiveTo = effectiveTo;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
