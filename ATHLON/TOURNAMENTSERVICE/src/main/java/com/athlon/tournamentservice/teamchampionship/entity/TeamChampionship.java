package com.athlon.tournamentservice.teamchampionship.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_championships")
public class TeamChampionship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "championship_id", updatable = false, nullable = false)
    private Long championshipId;

    @Column(name = "championship_uuid", updatable = false, nullable = false, unique = true)
    private UUID championshipUuid;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "sport", nullable = false)
    private String sport; // e.g. "Badminton", "Cricket", "Football", "Volleyball"

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "registration_closing_date")
    private LocalDateTime registrationClosingDate;

    @Column(name = "organizer_id", nullable = false)
    private Long organizerId;

    @Column(name = "organizer_uuid", nullable = false)
    private UUID organizerUuid;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_uuid")
    private UUID userUuid;

    @Column(name = "venue")
    private String venue;

    @Column(name = "location")
    private String location;

    @Column(name = "map_link")
    private String mapLink;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "poster_url")
    private String posterUrl;

    @Column(name = "max_teams")
    private Integer maxTeams = 8;

    @Column(name = "team_registration_fee")
    private Double teamRegistrationFee = 0.0;

    @Column(name = "player_fee_mode")
    private String playerFeeMode = "FREE"; // "FREE", "GLOBAL_PAID", "CATEGORY_PAID"

    @Column(name = "default_player_fee")
    private Double defaultPlayerFee = 0.0;

    @Column(name = "auction_mode")
    private String auctionMode = "FULL_AUCTION"; // "FULL_AUCTION", "PARTIAL_AUCTION", "NO_AUCTION"

    @Column(name = "stage")
    private String stage = "SETUP"; // "SETUP", "REGISTRATION_OPEN", "AUCTION_ACTIVE", "SQUADS_LOCKED", "POOLS_SCHEDULED", "LEAGUE_ACTIVE", "KNOCKOUT_ACTIVE", "COMPLETED"

    @Column(name = "status")
    private String status = "DRAFT"; // "DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"

    @Column(name = "visibility")
    private String visibility = "PUBLIC"; // "PUBLIC", "PRIVATE"

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.championshipUuid == null) {
            this.championshipUuid = UUID.randomUUID();
        }
        if (this.maxTeams == null) this.maxTeams = 8;
        if (this.teamRegistrationFee == null) this.teamRegistrationFee = 0.0;
        if (this.playerFeeMode == null) this.playerFeeMode = "FREE";
        if (this.defaultPlayerFee == null) this.defaultPlayerFee = 0.0;
        if (this.auctionMode == null) this.auctionMode = "FULL_AUCTION";
        if (this.stage == null) this.stage = "SETUP";
        if (this.status == null) this.status = "DRAFT";
        if (this.visibility == null) this.visibility = "PUBLIC";
    }

    public TeamChampionship() {}

    public Long getChampionshipId() {
        return championshipId;
    }

    public void setChampionshipId(Long championshipId) {
        this.championshipId = championshipId;
    }

    public UUID getChampionshipUuid() {
        return championshipUuid;
    }

    public void setChampionshipUuid(UUID championshipUuid) {
        this.championshipUuid = championshipUuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSport() {
        return sport;
    }

    public void setSport(String sport) {
        this.sport = sport;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public LocalDateTime getRegistrationClosingDate() {
        return registrationClosingDate;
    }

    public void setRegistrationClosingDate(LocalDateTime registrationClosingDate) {
        this.registrationClosingDate = registrationClosingDate;
    }

    public Long getOrganizerId() {
        return organizerId;
    }

    public void setOrganizerId(Long organizerId) {
        this.organizerId = organizerId;
    }

    public UUID getOrganizerUuid() {
        return organizerUuid;
    }

    public void setOrganizerUuid(UUID organizerUuid) {
        this.organizerUuid = organizerUuid;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(UUID userUuid) {
        this.userUuid = userUuid;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getMapLink() {
        return mapLink;
    }

    public void setMapLink(String mapLink) {
        this.mapLink = mapLink;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public Integer getMaxTeams() {
        return maxTeams;
    }

    public void setMaxTeams(Integer maxTeams) {
        this.maxTeams = maxTeams;
    }

    public Double getTeamRegistrationFee() {
        return teamRegistrationFee;
    }

    public void setTeamRegistrationFee(Double teamRegistrationFee) {
        this.teamRegistrationFee = teamRegistrationFee;
    }

    public String getPlayerFeeMode() {
        return playerFeeMode;
    }

    public void setPlayerFeeMode(String playerFeeMode) {
        this.playerFeeMode = playerFeeMode;
    }

    public Double getDefaultPlayerFee() {
        return defaultPlayerFee;
    }

    public void setDefaultPlayerFee(Double defaultPlayerFee) {
        this.defaultPlayerFee = defaultPlayerFee;
    }

    public String getAuctionMode() {
        return auctionMode;
    }

    public void setAuctionMode(String auctionMode) {
        this.auctionMode = auctionMode;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
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
