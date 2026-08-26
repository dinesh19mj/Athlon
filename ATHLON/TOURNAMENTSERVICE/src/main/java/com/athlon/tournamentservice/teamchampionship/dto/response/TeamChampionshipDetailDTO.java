package com.athlon.tournamentservice.teamchampionship.dto.response;

import com.athlon.tournamentservice.teamchampionship.entity.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class TeamChampionshipDetailDTO {
    private Long championshipId;
    private UUID championshipUuid;
    private String name;
    private String description;
    private String sport;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime registrationClosingDate;
    private Long organizerId;
    private UUID organizerUuid;
    private String venue;
    private String location;
    private String mapLink;
    private String contactPhone;
    private String posterUrl;
    private Integer maxTeams;
    private Double teamRegistrationFee;
    private String playerFeeMode;
    private Double defaultPlayerFee;
    private String auctionMode;
    private String stage;
    private String status;
    private String visibility;

    private List<ChampionshipCategory> categories;
    private List<ChampionshipMatchFormat> matchFormats;
    private List<ChampionshipEvent> events;
    private List<TeamChampionshipPool> pools;
    private ChampionshipRulesConfig rules;
    private int registeredTeamsCount;
    private int registeredPlayersCount;

    public TeamChampionshipDetailDTO() {}

    public Long getChampionshipId() { return championshipId; }
    public void setChampionshipId(Long championshipId) { this.championshipId = championshipId; }

    public UUID getChampionshipUuid() { return championshipUuid; }
    public void setChampionshipUuid(UUID championshipUuid) { this.championshipUuid = championshipUuid; }

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

    public UUID getOrganizerUuid() { return organizerUuid; }
    public void setOrganizerUuid(UUID organizerUuid) { this.organizerUuid = organizerUuid; }

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

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }

    public List<ChampionshipCategory> getCategories() { return categories; }
    public void setCategories(List<ChampionshipCategory> categories) { this.categories = categories; }

    public List<ChampionshipMatchFormat> getMatchFormats() { return matchFormats; }
    public void setMatchFormats(List<ChampionshipMatchFormat> matchFormats) { this.matchFormats = matchFormats; }

    public List<ChampionshipEvent> getEvents() { return events; }
    public void setEvents(List<ChampionshipEvent> events) { this.events = events; }

    public List<TeamChampionshipPool> getPools() { return pools; }
    public void setPools(List<TeamChampionshipPool> pools) { this.pools = pools; }

    public ChampionshipRulesConfig getRules() { return rules; }
    public void setRules(ChampionshipRulesConfig rules) { this.rules = rules; }

    public int getRegisteredTeamsCount() { return registeredTeamsCount; }
    public void setRegisteredTeamsCount(int registeredTeamsCount) { this.registeredTeamsCount = registeredTeamsCount; }

    public int getRegisteredPlayersCount() { return registeredPlayersCount; }
    public void setRegisteredPlayersCount(int registeredPlayersCount) { this.registeredPlayersCount = registeredPlayersCount; }
}
