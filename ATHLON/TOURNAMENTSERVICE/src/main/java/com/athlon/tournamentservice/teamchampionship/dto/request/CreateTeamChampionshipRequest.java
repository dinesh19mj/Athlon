package com.athlon.tournamentservice.teamchampionship.dto.request;

import java.time.LocalDateTime;
import java.util.List;

public class CreateTeamChampionshipRequest {
    private String name;
    private String description;
    private String sport;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime registrationClosingDate;
    private Long organizerId;
    private String organizerUuid;
    private Long userId;
    private String userUuid;
    private String venue;
    private String location;
    private String mapLink;
    private String contactPhone;
    private String posterUrl;
    private Integer maxTeams;
    private Double teamRegistrationFee;
    private String playerFeeMode; // "FREE", "GLOBAL_PAID", "CATEGORY_PAID"
    private Double defaultPlayerFee;
    private String auctionMode; // "FULL_AUCTION", "PARTIAL_AUCTION", "NO_AUCTION"
    private String visibility;

    private List<ChampionshipCategoryDTO> categories;
    private List<ChampionshipMatchFormatDTO> matchFormats;
    private List<ChampionshipEventDTO> events;
    private List<ChampionshipPoolDTO> pools;
    private ChampionshipRulesDTO rules;
    private AuctionSetupDTO auctionSetup;

    public CreateTeamChampionshipRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSport() { return sport; }
    public void setSport(String sport) { this.sport = sport; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public LocalDateTime getRegistrationClosingDate() { return registrationClosingDate; }
    public void setRegistrationClosingDate(LocalDateTime registrationClosingDate) { this.registrationClosingDate = registrationClosingDate; }

    public Long getOrganizerId() { return organizerId; }
    public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }

    public String getOrganizerUuid() { return organizerUuid; }
    public void setOrganizerUuid(String organizerUuid) { this.organizerUuid = organizerUuid; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserUuid() { return userUuid; }
    public void setUserUuid(String userUuid) { this.userUuid = userUuid; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getMapLink() { return mapLink; }
    public void setMapLink(String mapLink) { this.mapLink = mapLink; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public Integer getMaxTeams() { return maxTeams; }
    public void setMaxTeams(Integer maxTeams) { this.maxTeams = maxTeams; }

    public Double getTeamRegistrationFee() { return teamRegistrationFee; }
    public void setTeamRegistrationFee(Double teamRegistrationFee) { this.teamRegistrationFee = teamRegistrationFee; }

    public String getPlayerFeeMode() { return playerFeeMode; }
    public void setPlayerFeeMode(String playerFeeMode) { this.playerFeeMode = playerFeeMode; }

    public Double getDefaultPlayerFee() { return defaultPlayerFee; }
    public void setDefaultPlayerFee(Double defaultPlayerFee) { this.defaultPlayerFee = defaultPlayerFee; }

    public String getAuctionMode() { return auctionMode; }
    public void setAuctionMode(String auctionMode) { this.auctionMode = auctionMode; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }

    public List<ChampionshipCategoryDTO> getCategories() { return categories; }
    public void setCategories(List<ChampionshipCategoryDTO> categories) { this.categories = categories; }

    public List<ChampionshipMatchFormatDTO> getMatchFormats() { return matchFormats; }
    public void setMatchFormats(List<ChampionshipMatchFormatDTO> matchFormats) { this.matchFormats = matchFormats; }

    public List<ChampionshipEventDTO> getEvents() { return events; }
    public void setEvents(List<ChampionshipEventDTO> events) { this.events = events; }

    public List<ChampionshipPoolDTO> getPools() { return pools; }
    public void setPools(List<ChampionshipPoolDTO> pools) { this.pools = pools; }

    public ChampionshipRulesDTO getRules() { return rules; }
    public void setRules(ChampionshipRulesDTO rules) { this.rules = rules; }

    public AuctionSetupDTO getAuctionSetup() { return auctionSetup; }
    public void setAuctionSetup(AuctionSetupDTO auctionSetup) { this.auctionSetup = auctionSetup; }
}
