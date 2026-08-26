package com.athlon.tournamentservice.teamchampionship.dto.request;

import java.util.List;

public class PlayerRegistrationRequest {
    private Long championshipId;
    private String championshipUuid;
    private Long userId;
    private String userUuid;
    private String fullName;
    private String phone;
    private String email;
    private Long categoryId;
    private String categoryName;
    private List<String> eligibleFormats;
    private Double basePrice;
    private Double feeAmount;
    private String paymentStatus;
    private String avatarUrl;

    public PlayerRegistrationRequest() {}

    public Long getChampionshipId() { return championshipId; }
    public void setChampionshipId(Long championshipId) { this.championshipId = championshipId; }

    public String getChampionshipUuid() { return championshipUuid; }
    public void setChampionshipUuid(String championshipUuid) { this.championshipUuid = championshipUuid; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserUuid() { return userUuid; }
    public void setUserUuid(String userUuid) { this.userUuid = userUuid; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public List<String> getEligibleFormats() { return eligibleFormats; }
    public void setEligibleFormats(List<String> eligibleFormats) { this.eligibleFormats = eligibleFormats; }

    public Double getBasePrice() { return basePrice; }
    public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }

    public Double getFeeAmount() { return feeAmount; }
    public void setFeeAmount(Double feeAmount) { this.feeAmount = feeAmount; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
