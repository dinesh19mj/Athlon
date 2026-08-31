package com.athlon.identityservice.organization.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public class AcademyCentreResponse {

    private Long centreId;
    private UUID centreUuid;
    private Long organizationId;
    private UUID organizationUuid;
    private String name;
    private String code;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String contactPhone;
    private String contactEmail;
    private String mapLocationUrl;
    private String operatingHours;
    private String sportsAvailable;
    private String managerName;
    private String managerPhone;
    private String status;

    private Integer facilitiesCount = 0;
    private Integer activeBatchesCount = 0;
    private Integer activeStudentsCount = 0;
    private Integer activeCoachesCount = 0;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getCentreId() {
        return centreId;
    }

    public void setCentreId(Long centreId) {
        this.centreId = centreId;
    }

    public UUID getCentreUuid() {
        return centreUuid;
    }

    public void setCentreUuid(UUID centreUuid) {
        this.centreUuid = centreUuid;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
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

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getMapLocationUrl() {
        return mapLocationUrl;
    }

    public void setMapLocationUrl(String mapLocationUrl) {
        this.mapLocationUrl = mapLocationUrl;
    }

    public String getOperatingHours() {
        return operatingHours;
    }

    public void setOperatingHours(String operatingHours) {
        this.operatingHours = operatingHours;
    }

    public String getSportsAvailable() {
        return sportsAvailable;
    }

    public void setSportsAvailable(String sportsAvailable) {
        this.sportsAvailable = sportsAvailable;
    }

    public String getManagerName() {
        return managerName;
    }

    public void setManagerName(String managerName) {
        this.managerName = managerName;
    }

    public String getManagerPhone() {
        return managerPhone;
    }

    public void setManagerPhone(String managerPhone) {
        this.managerPhone = managerPhone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getFacilitiesCount() {
        return facilitiesCount;
    }

    public void setFacilitiesCount(Integer facilitiesCount) {
        this.facilitiesCount = facilitiesCount;
    }

    public Integer getActiveBatchesCount() {
        return activeBatchesCount;
    }

    public void setActiveBatchesCount(Integer activeBatchesCount) {
        this.activeBatchesCount = activeBatchesCount;
    }

    public Integer getActiveStudentsCount() {
        return activeStudentsCount;
    }

    public void setActiveStudentsCount(Integer activeStudentsCount) {
        this.activeStudentsCount = activeStudentsCount;
    }

    public Integer getActiveCoachesCount() {
        return activeCoachesCount;
    }

    public void setActiveCoachesCount(Integer activeCoachesCount) {
        this.activeCoachesCount = activeCoachesCount;
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
}
