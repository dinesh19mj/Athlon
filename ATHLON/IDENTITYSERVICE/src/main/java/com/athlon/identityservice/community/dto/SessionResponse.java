package com.athlon.identityservice.community.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import com.athlon.identityservice.community.enums.SessionRsvpStatus;
import com.athlon.identityservice.community.enums.SessionStatus;

public class SessionResponse {

    private Long sessionId;
    private UUID sessionUuid;
    private UUID communityUuid;
    private UUID creatorUserUuid;
    private String creatorUserName;
    private String sport;
    private String title;
    private String description;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Long venueId;
    private UUID venueUuid;
    private String venueName;
    private String courtName;
    private String city;
    private String state;
    private String googleMapUrl;
    private String locationAddress;
    private String genderCategory;
    private Integer maxMalePlayers;
    private Integer maxFemalePlayers;
    private Integer maxPlayers;
    private Integer confirmedPlayersCount;
    private String skillLevel;
    private BigDecimal costPerPlayer;
    private Boolean isRecurring;
    private String recurrenceRule;
    private SessionStatus status;
    private SessionRsvpStatus currentUserRsvp;
    private List<SessionRsvpDto> rsvps;
    private LocalDateTime createdAt;

    public SessionResponse() {
    }

    public static class SessionRsvpDto {
        private UUID userUuid;
        private Long userId;
        private String userName;
        private String userAvatar;
        private SessionRsvpStatus rsvpStatus;
        private Integer guestCount;
        private String notes;

        public SessionRsvpDto() {
        }

        public SessionRsvpDto(UUID userUuid, Long userId, String userName, String userAvatar, SessionRsvpStatus rsvpStatus, Integer guestCount, String notes) {
            this.userUuid = userUuid;
            this.userId = userId;
            this.userName = userName;
            this.userAvatar = userAvatar;
            this.rsvpStatus = rsvpStatus;
            this.guestCount = guestCount;
            this.notes = notes;
        }

        public UUID getUserUuid() {
            return userUuid;
        }

        public void setUserUuid(UUID userUuid) {
            this.userUuid = userUuid;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }

        public String getUserAvatar() {
            return userAvatar;
        }

        public void setUserAvatar(String userAvatar) {
            this.userAvatar = userAvatar;
        }

        public SessionRsvpStatus getRsvpStatus() {
            return rsvpStatus;
        }

        public void setRsvpStatus(SessionRsvpStatus rsvpStatus) {
            this.rsvpStatus = rsvpStatus;
        }

        public Integer getGuestCount() {
            return guestCount;
        }

        public void setGuestCount(Integer guestCount) {
            this.guestCount = guestCount;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public UUID getSessionUuid() {
        return sessionUuid;
    }

    public void setSessionUuid(UUID sessionUuid) {
        this.sessionUuid = sessionUuid;
    }

    public UUID getCommunityUuid() {
        return communityUuid;
    }

    public void setCommunityUuid(UUID communityUuid) {
        this.communityUuid = communityUuid;
    }

    public UUID getCreatorUserUuid() {
        return creatorUserUuid;
    }

    public void setCreatorUserUuid(UUID creatorUserUuid) {
        this.creatorUserUuid = creatorUserUuid;
    }

    public String getCreatorUserName() {
        return creatorUserName;
    }

    public void setCreatorUserName(String creatorUserName) {
        this.creatorUserName = creatorUserName;
    }

    public String getSport() {
        return sport;
    }

    public void setSport(String sport) {
        this.sport = sport;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDate sessionDate) {
        this.sessionDate = sessionDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public UUID getVenueUuid() {
        return venueUuid;
    }

    public void setVenueUuid(UUID venueUuid) {
        this.venueUuid = venueUuid;
    }

    public String getVenueName() {
        return venueName;
    }

    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }

    public String getCourtName() {
        return courtName;
    }

    public void setCourtName(String courtName) {
        this.courtName = courtName;
    }

    public String getLocationAddress() {
        return locationAddress;
    }

    public void setLocationAddress(String locationAddress) {
        this.locationAddress = locationAddress;
    }

    public Integer getMaxPlayers() {
        return maxPlayers;
    }

    public void setMaxPlayers(Integer maxPlayers) {
        this.maxPlayers = maxPlayers;
    }

    public Integer getConfirmedPlayersCount() {
        return confirmedPlayersCount;
    }

    public void setConfirmedPlayersCount(Integer confirmedPlayersCount) {
        this.confirmedPlayersCount = confirmedPlayersCount;
    }

    public String getSkillLevel() {
        return skillLevel;
    }

    public void setSkillLevel(String skillLevel) {
        this.skillLevel = skillLevel;
    }

    public BigDecimal getCostPerPlayer() {
        return costPerPlayer;
    }

    public void setCostPerPlayer(BigDecimal costPerPlayer) {
        this.costPerPlayer = costPerPlayer;
    }

    public BigDecimal getCostPerPerson() {
        return costPerPlayer;
    }

    public Integer getGoingCount() {
        return confirmedPlayersCount != null ? confirmedPlayersCount : 0;
    }

    public Integer getMaxParticipants() {
        return maxPlayers;
    }

    public Boolean getIsRecurring() {
        return isRecurring;
    }

    public void setIsRecurring(Boolean isRecurring) {
        this.isRecurring = isRecurring;
    }

    public String getRecurrenceRule() {
        return recurrenceRule;
    }

    public void setRecurrenceRule(String recurrenceRule) {
        this.recurrenceRule = recurrenceRule;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public SessionRsvpStatus getCurrentUserRsvp() {
        return currentUserRsvp;
    }

    public void setCurrentUserRsvp(SessionRsvpStatus currentUserRsvp) {
        this.currentUserRsvp = currentUserRsvp;
    }

    public List<SessionRsvpDto> getRsvps() {
        return rsvps;
    }

    public void setRsvps(List<SessionRsvpDto> rsvps) {
        this.rsvps = rsvps;
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

    public String getGoogleMapUrl() {
        return googleMapUrl;
    }

    public void setGoogleMapUrl(String googleMapUrl) {
        this.googleMapUrl = googleMapUrl;
    }

    public String getGenderCategory() {
        return genderCategory;
    }

    public void setGenderCategory(String genderCategory) {
        this.genderCategory = genderCategory;
    }

    public Integer getMaxMalePlayers() {
        return maxMalePlayers;
    }

    public void setMaxMalePlayers(Integer maxMalePlayers) {
        this.maxMalePlayers = maxMalePlayers;
    }

    public Integer getMaxFemalePlayers() {
        return maxFemalePlayers;
    }

    public void setMaxFemalePlayers(Integer maxFemalePlayers) {
        this.maxFemalePlayers = maxFemalePlayers;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
