package com.athlon.identityservice.user.dto.request;

public class UserSearchRequest {

    private String email;
    private String name;
    private Boolean isActive;
    
    // For pagination/sorting we could add page, size, sortBy, sortDir

    public UserSearchRequest() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
