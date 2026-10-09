package com.athlon.tournamentservice.dto.response;

import com.athlon.tournamentservice.tournament.entity.TournamentAnnouncement;

import java.time.LocalDateTime;
import java.util.UUID;

public class TournamentAnnouncementResponse {

    private Long id;
    private UUID uuid;
    private Long tournamentId;
    private UUID tournamentUuid;
    private String title;
    private String content;
    private String sport;
    private String matchFormat;
    private String category;
    private String categoryDetails;
    private String posterUrl;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime registrationDeadline;
    private String venueName;
    private String city;
    private String district;
    private String state;
    private String address;
    private String locationMapUrl;
    private String entryFee;
    private String prizePool;
    private String organizerName;
    private String contactPhone;
    private String contactEmail;
    private String whatsappNumber;
    private String externalRegistrationUrl;
    private String upiQrCodeUrl;
    private UUID userUuid;
    private String status;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TournamentAnnouncementResponse() {
    }

    public static TournamentAnnouncementResponse fromEntity(TournamentAnnouncement entity) {
        if (entity == null) return null;
        TournamentAnnouncementResponse res = new TournamentAnnouncementResponse();
        res.setId(entity.getId());
        res.setUuid(entity.getUuid());
        res.setTournamentId(entity.getTournamentId());
        res.setTournamentUuid(entity.getTournamentUuid());
        res.setTitle(entity.getTitle());
        res.setContent(entity.getContent());
        res.setSport(entity.getSport());
        res.setMatchFormat(entity.getMatchFormat());
        res.setCategory(entity.getCategory());
        res.setCategoryDetails(entity.getCategoryDetails());
        res.setPosterUrl(entity.getPosterUrl());
        res.setStartDate(entity.getStartDate());
        res.setEndDate(entity.getEndDate());
        res.setRegistrationDeadline(entity.getRegistrationDeadline());
        res.setVenueName(entity.getVenueName());
        res.setCity(entity.getCity());
        res.setDistrict(entity.getDistrict());
        res.setState(entity.getState());
        res.setAddress(entity.getAddress());
        res.setLocationMapUrl(entity.getLocationMapUrl());
        res.setEntryFee(entity.getEntryFee());
        res.setPrizePool(entity.getPrizePool());
        res.setOrganizerName(entity.getOrganizerName());
        res.setContactPhone(entity.getContactPhone());
        res.setContactEmail(entity.getContactEmail());
        res.setWhatsappNumber(entity.getWhatsappNumber());
        res.setExternalRegistrationUrl(entity.getExternalRegistrationUrl());
        res.setUpiQrCodeUrl(entity.getUpiQrCodeUrl());
        res.setUserUuid(entity.getUserUuid());
        res.setStatus(entity.getStatus());
        res.setActive(entity.isActive());
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }

    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }

    public UUID getTournamentUuid() { return tournamentUuid; }
    public void setTournamentUuid(UUID tournamentUuid) { this.tournamentUuid = tournamentUuid; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getSport() { return sport; }
    public void setSport(String sport) { this.sport = sport; }

    public String getMatchFormat() { return matchFormat; }
    public void setMatchFormat(String matchFormat) { this.matchFormat = matchFormat; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getCategoryDetails() { return categoryDetails; }
    public void setCategoryDetails(String categoryDetails) { this.categoryDetails = categoryDetails; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public LocalDateTime getRegistrationDeadline() { return registrationDeadline; }
    public void setRegistrationDeadline(LocalDateTime registrationDeadline) { this.registrationDeadline = registrationDeadline; }

    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getLocationMapUrl() { return locationMapUrl; }
    public void setLocationMapUrl(String locationMapUrl) { this.locationMapUrl = locationMapUrl; }

    public String getEntryFee() { return entryFee; }
    public void setEntryFee(String entryFee) { this.entryFee = entryFee; }

    public String getPrizePool() { return prizePool; }
    public void setPrizePool(String prizePool) { this.prizePool = prizePool; }

    public String getOrganizerName() { return organizerName; }
    public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }

    public String getExternalRegistrationUrl() { return externalRegistrationUrl; }
    public void setExternalRegistrationUrl(String externalRegistrationUrl) { this.externalRegistrationUrl = externalRegistrationUrl; }

    public String getUpiQrCodeUrl() { return upiQrCodeUrl; }
    public void setUpiQrCodeUrl(String upiQrCodeUrl) { this.upiQrCodeUrl = upiQrCodeUrl; }

    public UUID getUserUuid() { return userUuid; }
    public void setUserUuid(UUID userUuid) { this.userUuid = userUuid; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @com.fasterxml.jackson.annotation.JsonProperty("isActive")
    public boolean isActive() { return isActive; }
    @com.fasterxml.jackson.annotation.JsonProperty("isActive")
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
