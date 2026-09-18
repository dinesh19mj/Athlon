package com.athlon.identityservice.venue.dto;

import com.athlon.identityservice.venue.enums.VenueStatus;
import com.athlon.identityservice.venue.enums.VenueType;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class VenueCreateRequest {
    private Long organizationId;
    private UUID organizationUuid;
    private String name;
    private String description;
    private VenueType venueType = VenueType.INDOOR;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String district;
    private String state;
    private String country = "India";
    private String postalCode;
    private Double latitude;
    private Double longitude;
    private String contactNumber;
    private String email;
    private Boolean bookingEnabled = true;
    private VenueStatus status = VenueStatus.ACTIVE;
    private String rulesAndRegulations;
    private String cancellationPolicy;
    private List<OperatingHourInput> operatingHours;
    private List<AmenityInput> amenities;
    private List<ImageInput> images;

    public static class OperatingHourInput {
        private String dayOfWeek;
        private LocalTime openingTime;
        private LocalTime closingTime;
        private Boolean isClosed = false;

        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
        public LocalTime getOpeningTime() { return openingTime; }
        public void setOpeningTime(LocalTime openingTime) { this.openingTime = openingTime; }
        public LocalTime getClosingTime() { return closingTime; }
        public void setClosingTime(LocalTime closingTime) { this.closingTime = closingTime; }
        public Boolean getIsClosed() { return isClosed; }
        public void setIsClosed(Boolean isClosed) { this.isClosed = isClosed; }
    }

    public static class AmenityInput {
        private String amenityName;
        private String iconName;
        private String description;

        public String getAmenityName() { return amenityName; }
        public void setAmenityName(String amenityName) { this.amenityName = amenityName; }
        public String getIconName() { return iconName; }
        public void setIconName(String iconName) { this.iconName = iconName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class ImageInput {
        private String imageUrl;
        private String caption;
        private Integer displayOrder = 0;
        private Boolean isCover = false;

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getCaption() { return caption; }
        public void setCaption(String caption) { this.caption = caption; }
        public Integer getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
        public Boolean getIsCover() { return isCover; }
        public void setIsCover(Boolean isCover) { this.isCover = isCover; }
    }

    public VenueCreateRequest() {}

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
    public Boolean getBookingEnabled() { return bookingEnabled; }
    public void setBookingEnabled(Boolean bookingEnabled) { this.bookingEnabled = bookingEnabled; }
    public VenueStatus getStatus() { return status; }
    public void setStatus(VenueStatus status) { this.status = status; }
    public String getRulesAndRegulations() { return rulesAndRegulations; }
    public void setRulesAndRegulations(String rulesAndRegulations) { this.rulesAndRegulations = rulesAndRegulations; }
    public String getCancellationPolicy() { return cancellationPolicy; }
    public void setCancellationPolicy(String cancellationPolicy) { this.cancellationPolicy = cancellationPolicy; }
    public List<OperatingHourInput> getOperatingHours() { return operatingHours; }
    public void setOperatingHours(List<OperatingHourInput> operatingHours) { this.operatingHours = operatingHours; }
    public List<AmenityInput> getAmenities() { return amenities; }
    public void setAmenities(List<AmenityInput> amenities) { this.amenities = amenities; }
    public List<ImageInput> getImages() { return images; }
    public void setImages(List<ImageInput> images) { this.images = images; }
}
