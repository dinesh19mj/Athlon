package com.athlon.identityservice.user.dto.response;

import java.util.List;
import java.util.UUID;

public class UserResponse {

    private UUID uuid;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private Integer isActive;
    private List<SportsProfileResponse> sportsProfiles;

    public UserResponse() {
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getIsActive() {
		return isActive;
	}

	public void setIsActive(Integer isActive) {
		this.isActive = isActive;
	}

	public List<SportsProfileResponse> getSportsProfiles() {
        return sportsProfiles;
    }

    public void setSportsProfiles(List<SportsProfileResponse> sportsProfiles) {
        this.sportsProfiles = sportsProfiles;
    }
}
