package com.athlon.identityservice.venue.dto;

import com.athlon.identityservice.venue.enums.FacilityStatus;
import com.athlon.identityservice.venue.enums.FacilityType;
import com.athlon.identityservice.venue.enums.PricingType;
import com.athlon.identityservice.venue.enums.SurfaceType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class FacilityDto {
    private Long facilityId;
    private UUID facilityUuid;
    private Long venueId;
    private UUID venueUuid;
    private String venueName;
    private String name;
    private String description;
    private FacilityType facilityType;
    private String indoorOutdoor;
    private SurfaceType surfaceType;
    private Integer capacity;
    private Boolean bookingEnabled;
    private Integer slotDurationMinutes;
    private Integer minimumBookingMinutes;
    private Integer maximumBookingMinutes;
    private Integer advanceBookingDays;
    private Boolean cancellationEnabled;
    private FacilityStatus status;
    private List<SportDto> sports;
    private List<AvailabilityRuleDto> availabilityRules;
    private List<PricingRuleDto> pricingRules;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static class SportDto {
        private Long id;
        private Long sportId;
        private String sportName;
        private Boolean isPrimary;

        public SportDto() {}
        public SportDto(Long id, Long sportId, String sportName, Boolean isPrimary) {
            this.id = id;
            this.sportId = sportId;
            this.sportName = sportName;
            this.isPrimary = isPrimary;
        }
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getSportId() { return sportId; }
        public void setSportId(Long sportId) { this.sportId = sportId; }
        public String getSportName() { return sportName; }
        public void setSportName(String sportName) { this.sportName = sportName; }
        public Boolean getIsPrimary() { return isPrimary; }
        public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }
    }

    public static class AvailabilityRuleDto {
        private Long id;
        private String dayOfWeek;
        private LocalTime availableFrom;
        private LocalTime availableTo;
        private Integer slotDurationMinutes;
        private Boolean isActive;
        private LocalDate effectiveFrom;
        private LocalDate effectiveTo;

        public AvailabilityRuleDto() {}
        public AvailabilityRuleDto(Long id, String dayOfWeek, LocalTime availableFrom, LocalTime availableTo, Integer slotDurationMinutes, Boolean isActive, LocalDate effectiveFrom, LocalDate effectiveTo) {
            this.id = id;
            this.dayOfWeek = dayOfWeek;
            this.availableFrom = availableFrom;
            this.availableTo = availableTo;
            this.slotDurationMinutes = slotDurationMinutes;
            this.isActive = isActive;
            this.effectiveFrom = effectiveFrom;
            this.effectiveTo = effectiveTo;
        }
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
        public LocalTime getAvailableFrom() { return availableFrom; }
        public void setAvailableFrom(LocalTime availableFrom) { this.availableFrom = availableFrom; }
        public LocalTime getAvailableTo() { return availableTo; }
        public void setAvailableTo(LocalTime availableTo) { this.availableTo = availableTo; }
        public Integer getSlotDurationMinutes() { return slotDurationMinutes; }
        public void setSlotDurationMinutes(Integer slotDurationMinutes) { this.slotDurationMinutes = slotDurationMinutes; }
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
        public LocalDate getEffectiveFrom() { return effectiveFrom; }
        public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }
        public LocalDate getEffectiveTo() { return effectiveTo; }
        public void setEffectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; }
    }

    public static class PricingRuleDto {
        private Long id;
        private PricingType pricingType;
        private String dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private BigDecimal price;
        private Integer durationMinutes;
        private LocalDate effectiveFrom;
        private LocalDate effectiveTo;
        private Integer priority;
        private Boolean isActive;

        public PricingRuleDto() {}
        public PricingRuleDto(Long id, PricingType pricingType, String dayOfWeek, LocalTime startTime, LocalTime endTime, BigDecimal price, Integer durationMinutes, LocalDate effectiveFrom, LocalDate effectiveTo, Integer priority, Boolean isActive) {
            this.id = id;
            this.pricingType = pricingType;
            this.dayOfWeek = dayOfWeek;
            this.startTime = startTime;
            this.endTime = endTime;
            this.price = price;
            this.durationMinutes = durationMinutes;
            this.effectiveFrom = effectiveFrom;
            this.effectiveTo = effectiveTo;
            this.priority = priority;
            this.isActive = isActive;
        }
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public PricingType getPricingType() { return pricingType; }
        public void setPricingType(PricingType pricingType) { this.pricingType = pricingType; }
        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
        public LocalDate getEffectiveFrom() { return effectiveFrom; }
        public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }
        public LocalDate getEffectiveTo() { return effectiveTo; }
        public void setEffectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; }
        public Integer getPriority() { return priority; }
        public void setPriority(Integer priority) { this.priority = priority; }
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    }

    public FacilityDto() {}

    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
    public UUID getFacilityUuid() { return facilityUuid; }
    public void setFacilityUuid(UUID facilityUuid) { this.facilityUuid = facilityUuid; }
    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public UUID getVenueUuid() { return venueUuid; }
    public void setVenueUuid(UUID venueUuid) { this.venueUuid = venueUuid; }
    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public FacilityType getFacilityType() { return facilityType; }
    public void setFacilityType(FacilityType facilityType) { this.facilityType = facilityType; }
    public String getIndoorOutdoor() { return indoorOutdoor; }
    public void setIndoorOutdoor(String indoorOutdoor) { this.indoorOutdoor = indoorOutdoor; }
    public SurfaceType getSurfaceType() { return surfaceType; }
    public void setSurfaceType(SurfaceType surfaceType) { this.surfaceType = surfaceType; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public Boolean getBookingEnabled() { return bookingEnabled; }
    public void setBookingEnabled(Boolean bookingEnabled) { this.bookingEnabled = bookingEnabled; }
    public Integer getSlotDurationMinutes() { return slotDurationMinutes; }
    public void setSlotDurationMinutes(Integer slotDurationMinutes) { this.slotDurationMinutes = slotDurationMinutes; }
    public Integer getMinimumBookingMinutes() { return minimumBookingMinutes; }
    public void setMinimumBookingMinutes(Integer minimumBookingMinutes) { this.minimumBookingMinutes = minimumBookingMinutes; }
    public Integer getMaximumBookingMinutes() { return maximumBookingMinutes; }
    public void setMaximumBookingMinutes(Integer maximumBookingMinutes) { this.maximumBookingMinutes = maximumBookingMinutes; }
    public Integer getAdvanceBookingDays() { return advanceBookingDays; }
    public void setAdvanceBookingDays(Integer advanceBookingDays) { this.advanceBookingDays = advanceBookingDays; }
    public Boolean getCancellationEnabled() { return cancellationEnabled; }
    public void setCancellationEnabled(Boolean cancellationEnabled) { this.cancellationEnabled = cancellationEnabled; }
    public FacilityStatus getStatus() { return status; }
    public void setStatus(FacilityStatus status) { this.status = status; }
    public List<SportDto> getSports() { return sports; }
    public void setSports(List<SportDto> sports) { this.sports = sports; }
    public List<AvailabilityRuleDto> getAvailabilityRules() { return availabilityRules; }
    public void setAvailabilityRules(List<AvailabilityRuleDto> availabilityRules) { this.availabilityRules = availabilityRules; }
    public List<PricingRuleDto> getPricingRules() { return pricingRules; }
    public void setPricingRules(List<PricingRuleDto> pricingRules) { this.pricingRules = pricingRules; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
