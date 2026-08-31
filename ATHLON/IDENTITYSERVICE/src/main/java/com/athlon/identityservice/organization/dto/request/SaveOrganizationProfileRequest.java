package com.athlon.identityservice.organization.dto.request;

import java.util.UUID;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SaveOrganizationProfileRequest {

    @NotNull(message = "Organization UUID is required")
    private UUID organizationUuid;

    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @Size(max = 100, message = "Type must not exceed 100 characters")
    private String type;

    private String description;

    @Size(max = 255, message = "Contact email must not exceed 255 characters")
    private String contactEmail;

    @Size(max = 50, message = "Contact phone must not exceed 50 characters")
    private String contactPhone;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 100, message = "District must not exceed 100 characters")
    private String district;

    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;

    @Size(max = 20, message = "Postal code must not exceed 20 characters")
    private String postalCode;

    @Size(max = 255, message = "Website must not exceed 255 characters")
    private String website;

    private String logo;

    private String banner;

    private Integer isPublic;

    private String sportsOffered;

    @Size(max = 50, message = "Admission status must not exceed 50 characters")
    private String admissionStatus;

    @Size(max = 255, message = "Academy levels must not exceed 255 characters")
    private String academyLevels;

    private Integer totalCourts;

    @Size(max = 255, message = "Surface type must not exceed 255 characters")
    private String surfaceType;

    @Size(max = 50, message = "Opening time must not exceed 50 characters")
    private String openingTime;

    @Size(max = 50, message = "Closing time must not exceed 50 characters")
    private String closingTime;

    private Double pricePerHour;

    private String amenities;

    private String bio;

    private Integer establishedYear;

    @Size(max = 100, message = "Registration number must not exceed 100 characters")
    private String registrationNumber;

    private Double monthlyFeeMin;

    private Double monthlyFeeMax;

    @Size(max = 100, message = "Operating days must not exceed 100 characters")
    private String operatingDays;

    @Size(max = 255, message = "Instagram link must not exceed 255 characters")
    private String socialInstagram;

    @Size(max = 255, message = "Facebook link must not exceed 255 characters")
    private String socialFacebook;

    @Size(max = 255, message = "YouTube link must not exceed 255 characters")
    private String socialYoutube;

    private Double rating;

    private Integer reviewsCount;

    public SaveOrganizationProfileRequest() {
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public String getBanner() {
        return banner;
    }

    public void setBanner(String banner) {
        this.banner = banner;
    }

    public Integer getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Integer isPublic) {
        this.isPublic = isPublic;
    }

    public String getSportsOffered() {
        return sportsOffered;
    }

    public void setSportsOffered(String sportsOffered) {
        this.sportsOffered = sportsOffered;
    }

    public String getAdmissionStatus() {
        return admissionStatus;
    }

    public void setAdmissionStatus(String admissionStatus) {
        this.admissionStatus = admissionStatus;
    }

    public String getAcademyLevels() {
        return academyLevels;
    }

    public void setAcademyLevels(String academyLevels) {
        this.academyLevels = academyLevels;
    }

    public Integer getTotalCourts() {
        return totalCourts;
    }

    public void setTotalCourts(Integer totalCourts) {
        this.totalCourts = totalCourts;
    }

    public String getSurfaceType() {
        return surfaceType;
    }

    public void setSurfaceType(String surfaceType) {
        this.surfaceType = surfaceType;
    }

    public String getOpeningTime() {
        return openingTime;
    }

    public void setOpeningTime(String openingTime) {
        this.openingTime = openingTime;
    }

    public String getClosingTime() {
        return closingTime;
    }

    public void setClosingTime(String closingTime) {
        this.closingTime = closingTime;
    }

    public Double getPricePerHour() {
        return pricePerHour;
    }

    public void setPricePerHour(Double pricePerHour) {
        this.pricePerHour = pricePerHour;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Integer getEstablishedYear() {
        return establishedYear;
    }

    public void setEstablishedYear(Integer establishedYear) {
        this.establishedYear = establishedYear;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public Double getMonthlyFeeMin() {
        return monthlyFeeMin;
    }

    public void setMonthlyFeeMin(Double monthlyFeeMin) {
        this.monthlyFeeMin = monthlyFeeMin;
    }

    public Double getMonthlyFeeMax() {
        return monthlyFeeMax;
    }

    public void setMonthlyFeeMax(Double monthlyFeeMax) {
        this.monthlyFeeMax = monthlyFeeMax;
    }

    public String getOperatingDays() {
        return operatingDays;
    }

    public void setOperatingDays(String operatingDays) {
        this.operatingDays = operatingDays;
    }

    public String getSocialInstagram() {
        return socialInstagram;
    }

    public void setSocialInstagram(String socialInstagram) {
        this.socialInstagram = socialInstagram;
    }

    public String getSocialFacebook() {
        return socialFacebook;
    }

    public void setSocialFacebook(String socialFacebook) {
        this.socialFacebook = socialFacebook;
    }

    public String getSocialYoutube() {
        return socialYoutube;
    }

    public void setSocialYoutube(String socialYoutube) {
        this.socialYoutube = socialYoutube;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviewsCount() {
        return reviewsCount;
    }

    public void setReviewsCount(Integer reviewsCount) {
        this.reviewsCount = reviewsCount;
    }
}
