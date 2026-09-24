package com.athlon.identityservice.community.dto;

import com.athlon.identityservice.community.enums.CommunityVisibility;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateCommunityRequest {

    @NotBlank(message = "Community name is required")
    @Size(max = 150, message = "Community name must not exceed 150 characters")
    private String name;

    @NotBlank(message = "Primary sport is required")
    private String primarySport;

    private String additionalSports;

    private CommunityVisibility visibility = CommunityVisibility.PUBLIC;

    private String description;

    private String rules;

    private String location;

    private String city;

    private String state;

    private String country = "India";

    private String logoUrl;

    private String coverImageUrl;

    public CreateCommunityRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPrimarySport() {
        return primarySport;
    }

    public void setPrimarySport(String primarySport) {
        this.primarySport = primarySport;
    }

    public String getAdditionalSports() {
        return additionalSports;
    }

    public void setAdditionalSports(String additionalSports) {
        this.additionalSports = additionalSports;
    }

    public CommunityVisibility getVisibility() {
        return visibility;
    }

    public void setVisibility(CommunityVisibility visibility) {
        this.visibility = visibility;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRules() {
        return rules;
    }

    public void setRules(String rules) {
        this.rules = rules;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }
}
