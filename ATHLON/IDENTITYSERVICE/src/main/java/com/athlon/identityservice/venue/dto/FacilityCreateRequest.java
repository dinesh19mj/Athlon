package com.athlon.identityservice.venue.dto;

import com.athlon.identityservice.venue.enums.FacilityStatus;
import com.athlon.identityservice.venue.enums.FacilityType;
import com.athlon.identityservice.venue.enums.PricingType;
import com.athlon.identityservice.venue.enums.SurfaceType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class FacilityCreateRequest {
    private Long venueId;
    private UUID venueUuid;
    private String name;
    private String description;
    private FacilityType facilityType = FacilityType.COURT;
    private String indoorOutdoor = "INDOOR";
    private SurfaceType surfaceType = SurfaceType.SYNTHETIC;
    private Integer capacity = 1;
    private Boolean bookingEnabled = true;
    private Integer slotDurationMinutes = 60;
    private Integer minimumBookingMinutes = 60;
    private Integer maximumBookingMinutes = 180;
    private Integer advanceBookingDays = 14;
    private Boolean cancellationEnabled = true;
    private FacilityStatus status = FacilityStatus.ACTIVE;
    private List<SportInput> sports;
    private List<AvailabilityRuleInput> availabilityRules;
    private List<PricingRuleInput> pricingRules;

    public static class SportInput {
        private Long sportId;
        private String sportName;
        private Boolean isPrimary = false;

        public Long getSportId() { return sportId; }
        public void setSportId(Long sportId) { this.sportId = sportId; }
        public String getSportName() { return sportName; }
        public void setSportName(String sportName) { this.sportName = sportName; }
        public Boolean getIsPrimary() { return isPrimary; }
        public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }
    }

    public static class AvailabilityRuleInput {
        private String dayOfWeek;
        private LocalTime availableFrom;
        private LocalTime availableTo;
        private Integer slotDurationMinutes = 60;
        private Boolean isActive = true;
        private LocalDate effectiveFrom;
        private LocalDate effectiveTo;

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

    public static class PricingRuleInput {
        private PricingType pricingType = PricingType.STANDARD;
        private String dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private BigDecimal price;
        private Integer durationMinutes = 60;
        private LocalDate effectiveFrom;
        private LocalDate effectiveTo;
        private Integer priority = 1;
        private Boolean isActive = true;

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

    public FacilityCreateRequest() {}

    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public UUID getVenueUuid() { return venueUuid; }
    public void setVenueUuid(UUID venueUuid) { this.venueUuid = venueUuid; }
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
    public List<SportInput> getSports() { return sports; }
    public void setSports(List<SportInput> sports) { this.sports = sports; }
    public List<AvailabilityRuleInput> getAvailabilityRules() { return availabilityRules; }
    public void setAvailabilityRules(List<AvailabilityRuleInput> availabilityRules) { this.availabilityRules = availabilityRules; }
    public List<PricingRuleInput> getPricingRules() { return pricingRules; }
    public void setPricingRules(List<PricingRuleInput> pricingRules) { this.pricingRules = pricingRules; }
}
