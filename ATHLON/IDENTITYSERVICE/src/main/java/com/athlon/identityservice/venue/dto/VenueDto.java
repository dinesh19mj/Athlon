package com.athlon.identityservice.venue.dto;

import com.athlon.identityservice.venue.enums.VenueStatus;
import com.athlon.identityservice.venue.enums.VenueType;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class VenueDto {
    private Long venueId;
    private UUID venueUuid;
    private Long organizationId;
    private UUID organizationUuid;
    private String name;
    private String description;
    private VenueType venueType;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String district;
    private String state;
    private String country;
    private String postalCode;
    private Double latitude;
    private Double longitude;
    private String contactNumber;
    private String email;
    private String openingStatus;
    private Boolean bookingEnabled;
    private VenueStatus status;
    private String rulesAndRegulations;
    private String cancellationPolicy;
    private List<OperatingHourDto> operatingHours;
    private List<AmenityDto> amenities;
    private List<ImageDto> images;
    private Integer totalFacilities;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static class OperatingHourDto {
        private Long id;
        private String dayOfWeek;
        private LocalTime openingTime;
        private LocalTime closingTime;
        private Boolean isClosed;

        public OperatingHourDto() {}
        public OperatingHourDto(Long id, String dayOfWeek, LocalTime openingTime, LocalTime closingTime, Boolean isClosed) {
            this.id = id;
            this.dayOfWeek = dayOfWeek;
            this.openingTime = openingTime;
            this.closingTime = closingTime;
            this.isClosed = isClosed;
        }
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
        public LocalTime getOpeningTime() { return openingTime; }
        public void setOpeningTime(LocalTime openingTime) { this.openingTime = openingTime; }
        public LocalTime getClosingTime() { return closingTime; }
        public void setClosingTime(LocalTime closingTime) { this.closingTime = closingTime; }
        public Boolean getIsClosed() { return isClosed; }
        public void setIsClosed(Boolean isClosed) { this.isClosed = isClosed; }
    }

    public static class AmenityDto {
        private Long id;
        private String amenityName;
        private String iconName;
        private String description;

        public AmenityDto() {}
        public AmenityDto(Long id, String amenityName, String iconName, String description) {
            this.id = id;
            this.amenityName = amenityName;
            this.iconName = iconName;
            this.description = description;
        }
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getAmenityName() { return amenityName; }
        public void setAmenityName(String amenityName) { this.amenityName = amenityName; }
        public String getIconName() { return iconName; }
        public void setIconName(String iconName) { this.iconName = iconName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class ImageDto {
        private Long id;
        private String imageUrl;
        private String caption;
        private Integer displayOrder;
        private Boolean isCover;

        public ImageDto() {}
        public ImageDto(Long id, String imageUrl, String caption, Integer displayOrder, Boolean isCover) {
            this.id = id;
            this.imageUrl = imageUrl;
            this.caption = caption;
            this.displayOrder = displayOrder;
            this.isCover = isCover;
        }
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getCaption() { return caption; }
        public void setCaption(String caption) { this.caption = caption; }
        public Integer getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
        public Boolean getIsCover() { return isCover; }
        public void setIsCover(Boolean isCover) { this.isCover = isCover; }
    }

    public VenueDto() {}

    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public UUID getVenueUuid() { return venueUuid; }
    public void setVenueUuid(UUID venueUuid) { this.venueUuid = venueUuid; }
    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }
    public UUID getOrganizationUuid() { return organizationUuid; }
    public void setOrganizationUuid(UUID organizationUuid) { this.organizationUuid = organizationUuid; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public VenueType getVenueType() { return venueType; }
    public void setVenueType(VenueType venueType) { this.venueType = venueType; }
    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getOpeningStatus() { return openingStatus; }
    public void setOpeningStatus(String openingStatus) { this.openingStatus = openingStatus; }
    public Boolean getBookingEnabled() { return bookingEnabled; }
    public void setBookingEnabled(Boolean bookingEnabled) { this.bookingEnabled = bookingEnabled; }
    public VenueStatus getStatus() { return status; }
    public void setStatus(VenueStatus status) { this.status = status; }
    public String getRulesAndRegulations() { return rulesAndRegulations; }
    public void setRulesAndRegulations(String rulesAndRegulations) { this.rulesAndRegulations = rulesAndRegulations; }
    public String getCancellationPolicy() { return cancellationPolicy; }
    public void setCancellationPolicy(String cancellationPolicy) { this.cancellationPolicy = cancellationPolicy; }
    public List<OperatingHourDto> getOperatingHours() { return operatingHours; }
    public void setOperatingHours(List<OperatingHourDto> operatingHours) { this.operatingHours = operatingHours; }
    public List<AmenityDto> getAmenities() { return amenities; }
    public void setAmenities(List<AmenityDto> amenities) { this.amenities = amenities; }
    public List<ImageDto> getImages() { return images; }
    public void setImages(List<ImageDto> images) { this.images = images; }
    public Integer getTotalFacilities() { return totalFacilities; }
    public void setTotalFacilities(Integer totalFacilities) { this.totalFacilities = totalFacilities; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
