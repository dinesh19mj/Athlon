package com.athlon.identityservice.venue.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "facility_availability_rules")
public class FacilityAvailabilityRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "facility_id", nullable = false)
    private Long facilityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 20)
    private DayOfWeek dayOfWeek;

    @Column(name = "available_from", nullable = false)
    private LocalTime availableFrom;

    @Column(name = "available_to", nullable = false)
    private LocalTime availableTo;

    @Column(name = "slot_duration_minutes")
    private Integer slotDurationMinutes = 60;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public FacilityAvailabilityRule() {
    }

    public FacilityAvailabilityRule(Long facilityId, DayOfWeek dayOfWeek, LocalTime availableFrom, LocalTime availableTo, Integer slotDurationMinutes) {
        this.facilityId = facilityId;
        this.dayOfWeek = dayOfWeek;
        this.availableFrom = availableFrom;
        this.availableTo = availableTo;
        this.slotDurationMinutes = slotDurationMinutes != null ? slotDurationMinutes : 60;
        this.isActive = true;
    }

    public FacilityAvailabilityRule(Long facilityId, DayOfWeek dayOfWeek, LocalTime availableFrom, LocalTime availableTo, Integer slotDurationMinutes, Boolean isActive, LocalDate effectiveFrom, LocalDate effectiveTo) {
        this.facilityId = facilityId;
        this.dayOfWeek = dayOfWeek;
        this.availableFrom = availableFrom;
        this.availableTo = availableTo;
        this.slotDurationMinutes = slotDurationMinutes != null ? slotDurationMinutes : 60;
        this.isActive = isActive != null ? isActive : true;
        this.effectiveFrom = effectiveFrom;
        this.effectiveTo = effectiveTo;
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

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(DayOfWeek dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public LocalTime getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(LocalTime availableFrom) {
        this.availableFrom = availableFrom;
    }

    public LocalTime getAvailableTo() {
        return availableTo;
    }

    public void setAvailableTo(LocalTime availableTo) {
        this.availableTo = availableTo;
    }

    public Integer getSlotDurationMinutes() {
        return slotDurationMinutes;
    }

    public void setSlotDurationMinutes(Integer slotDurationMinutes) {
        this.slotDurationMinutes = slotDurationMinutes;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
