package com.athlon.tournamentservice.tournament.entity;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "tournaments")
public class Tournament {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "tournamentid", updatable = false, nullable = false)
	private Long tournamentId;

	@Column(name = "tournamentuuid", updatable = false, nullable = false, unique = true)
	private UUID tournamentUuid;

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	@Column(name = "startdate")
	private LocalDateTime startDate;

	@Column(name = "enddate")
	private LocalDateTime endDate;

	@Column(name = "organizerid", nullable = false)
	private Long organizerId;

	@Column(name = "organizeruuid", nullable = false)
	private UUID organizerUuid;

	@Column(name = "userid")
	private Long userId;

	@Column(name = "useruuid")
	private UUID userUuid;

	@Column(name = "tournament_type")
	private String tournamentType;

	@Column(name = "sport")
	private String sport;

	@Column(name = "matchformat")
	private String matchFormat;

	@Column(name = "visibility")
	private String visibility;

	@Column(name = "category")
	private String category;

	@Column(name = "playerscount")
	private Integer playersCount;

	@Column(name = "location")
	private String location;

	@Column(name = "maplink")
	private String mapLink;

	@Column(name = "contactphone")
	private String contactPhone;

	@Column(name = "registrationfees")
	private Double registrationFees;

	@Column(name = "poster")
	private String poster;

	@Column(name = "status")
	private String status;

	@Column(name = "isactive")
	private Integer isActive = 1;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@Column(name = "created_by")
	private Long createdBy;

	@Column(name = "updated_by")
	private Long updatedBy;

	public Tournament() {
	}

	public Tournament(String name, String description, LocalDateTime startDate, LocalDateTime endDate, Long organizerId,
			UUID organizerUuid, Long userId, UUID userUuid, String tournamentType, String sport, String matchFormat,
			String visibility, String category, Integer playersCount, String location, String mapLink,
			String contactPhone, Double registrationFees, String poster, String status, Long createdBy) {

		this.name = name;
		this.description = description;
		this.startDate = startDate;
		this.endDate = endDate;
		this.organizerId = organizerId;
		this.organizerUuid = organizerUuid;
		this.userId = userId;
		this.userUuid = userUuid;
		this.tournamentType = tournamentType;
		this.sport = sport;
		this.matchFormat = matchFormat;
		this.visibility = visibility;
		this.category = category;
		this.playersCount = playersCount;
		this.location = location;
		this.mapLink = mapLink;
		this.contactPhone = contactPhone;
		this.registrationFees = registrationFees;
		this.poster = poster;
		this.status = status;
		this.createdBy = createdBy;
		this.isActive = 1;
	}

	@PrePersist
	public void prePersist() {

		if (tournamentUuid == null) {
			tournamentUuid = UUID.randomUUID();
		}

		if (isActive == null) {
			isActive = 1;
		}
	}

	public Long getTournamentId() {
		return tournamentId;
	}

	public void setTournamentId(Long tournamentId) {
		this.tournamentId = tournamentId;
	}

	public UUID getTournamentUuid() {
		return tournamentUuid;
	}

	public void setTournamentUuid(UUID tournamentUuid) {
		this.tournamentUuid = tournamentUuid;
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

	public String getSport() {
		return sport;
	}

	public void setSport(String sport) {
		this.sport = sport;
	}

	public String getTournamentType() {
		return tournamentType;
	}

	public void setTournamentType(String tournamentType) {
		this.tournamentType = tournamentType;
	}

	public String getMatchFormat() {
		return matchFormat;
	}

	public void setMatchFormat(String matchFormat) {
		this.matchFormat = matchFormat;
	}

	public Integer getPlayersCount() {
		return playersCount;
	}

	public void setPlayersCount(Integer playersCount) {
		this.playersCount = playersCount;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public String getVisibility() {
		return visibility;
	}

	public void setVisibility(String visibility) {
		this.visibility = visibility;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
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

	public Double getRegistrationFees() {
		return registrationFees;
	}

	public void setRegistrationFees(Double registrationFees) {
		this.registrationFees = registrationFees;
	}

	public String getPoster() {
		return poster;
	}

	public void setPoster(String poster) {
		this.poster = poster;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Integer getIsActive() {
		return isActive;
	}

	public void setIsActive(Integer isActive) {
		this.isActive = isActive;
	}

	public boolean isActive() {
		return isActive != null && isActive == 1;
	}

	public void setActive(boolean active) {
		this.isActive = active ? 1 : 0;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public Long getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(Long createdBy) {
		this.createdBy = createdBy;
	}

	public Long getUpdatedBy() {
		return updatedBy;
	}

	public void setUpdatedBy(Long updatedBy) {
		this.updatedBy = updatedBy;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;
		if (!(o instanceof Tournament))
			return false;
		Tournament that = (Tournament) o;
		return Objects.equals(tournamentId, that.tournamentId) && Objects.equals(tournamentUuid, that.tournamentUuid);
	}

	@Override
	public int hashCode() {
		return Objects.hash(tournamentId, tournamentUuid);
	}

	@Override
	public String toString() {
		return "Tournament{" + "tournamentId=" + tournamentId + ", tournamentUuid=" + tournamentUuid + ", name='" + name
				+ '\'' + ", tournamentType='" + tournamentType + '\'' + ", sport='" + sport + '\'' + ", category='"
				+ category + '\'' + ", matchFormat='" + matchFormat + '\'' + ", playersCount=" + playersCount
				+ ", organizerId=" + organizerId + ", organizerUuid=" + organizerUuid + ", userId=" + userId
				+ ", userUuid=" + userUuid + ", visibility='" + visibility + '\'' + ", location='" + location + '\''
				+ ", contactPhone='" + contactPhone + '\'' + ", registrationFees=" + registrationFees + ", status='"
				+ status + '\'' + ", isActive=" + isActive + '}';
	}
}
