package com.athlon.tournamentservice.teamchampionship.dto.request;

public class TeamRegistrationRequest {
    private Long championshipId;
    private String championshipUuid;
    private String teamName;
    private String logoUrl;
    private Long ownerUserId;
    private String ownerUserUuid;
    private String captainName;
    private String contactPhone;
    private String contactEmail;
    private Double paymentAmount;
    private String paymentStatus;

    public TeamRegistrationRequest() {}

    public Long getChampionshipId() { return championshipId; }
    public void setChampionshipId(Long championshipId) { this.championshipId = championshipId; }

    public String getChampionshipUuid() { return championshipUuid; }
    public void setChampionshipUuid(String championshipUuid) { this.championshipUuid = championshipUuid; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public Long getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(Long ownerUserId) { this.ownerUserId = ownerUserId; }

    public String getOwnerUserUuid() { return ownerUserUuid; }
    public void setOwnerUserUuid(String ownerUserUuid) { this.ownerUserUuid = ownerUserUuid; }

    public String getCaptainName() { return captainName; }
    public void setCaptainName(String captainName) { this.captainName = captainName; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public Double getPaymentAmount() { return paymentAmount; }
    public void setPaymentAmount(Double paymentAmount) { this.paymentAmount = paymentAmount; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}
