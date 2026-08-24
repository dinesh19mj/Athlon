package com.athlon.identityservice.organization.entity;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "organization_profiles")
public class OrganizationProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "organizationprofileid", updatable = false, nullable = false)
    private Long organizationProfileId;

    @Column(name = "organizationprofileuuid", updatable = false, nullable = false, unique = true)
    private UUID organizationProfileUuid;

    @Column(name = "organizationid", nullable = false)
    private Long organizationId;

    @Column(name = "organizationuuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "contactemail", length = 255)
    private String contactEmail;

    @Column(name = "contactphone", length = 50)
    private String contactPhone;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "postalcode", length = 20)
    private String postalCode;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "logo", columnDefinition = "TEXT")
    private String logo;

    @Column(name = "banner", columnDefinition = "TEXT")
    private String banner;

    @Column(name = "ispublic")
    private Integer isPublic = 0;

    @Column(name = "sportsoffered", length = 500)
    private String sportsOffered;

    @Column(name = "admissionstatus", length = 50)
    private String admissionStatus;

    @Column(name = "academylevels", length = 255)
    private String academyLevels;

    @Column(name = "totalcourts")
    private Integer totalCourts;

    @Column(name = "surfacetype", length = 255)
    private String surfaceType;

    @Column(name = "openingtime", length = 50)
    private String openingTime;

    @Column(name = "closingtime", length = 50)
    private String closingTime;

    @Column(name = "priceperhour")
    private Double pricePerHour;

    @Column(name = "amenities", columnDefinition = "TEXT")
    private String amenities;

    @Column(name = "isactive")
    private Integer isActive = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    public OrganizationProfile() {
    }

    public OrganizationProfile(Long organizationId, UUID organizationUuid, Long createdBy) {
        this.organizationId = organizationId;
        this.organizationUuid = organizationUuid;
        this.createdBy = createdBy;
        this.isActive = 1;
    }

    @PrePersist
    public void prePersist() {
        if (organizationProfileUuid == null) {
            organizationProfileUuid = UUID.randomUUID();
        }
        if (isActive == null) {
            isActive = 1;
        }
        if (isPublic == null) {
            isPublic = 0;
        }
    }

    public Long getOrganizationProfileId() {
        return organizationProfileId;
    }

    public void setOrganizationProfileId(Long organizationProfileId) {
        this.organizationProfileId = organizationProfileId;
    }

    public UUID getOrganizationProfileUuid() {
        return organizationProfileUuid;
    }

    public void setOrganizationProfileUuid(UUID organizationProfileUuid) {
        this.organizationProfileUuid = organizationProfileUuid;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
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

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrganizationProfile)) return false;
        OrganizationProfile that = (OrganizationProfile) o;
        return Objects.equals(organizationProfileUuid, that.organizationProfileUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(organizationProfileUuid);
    }
}
