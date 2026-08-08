package com.athlon.tournamentservice.registration.entity;

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
@Table(name = "registration_players")
public class RegistrationPlayer {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "registrationplayerid", updatable = false, nullable = false)
	private Long registrationPlayerId;

	@Column(name = "registrationplayeruuid", updatable = false, nullable = false, unique = true)
	private UUID registrationPlayerUuid;

	@Column(name = "registrationid", nullable = false)
	private Long registrationId;

	@Column(name = "registrationuuid", nullable = false)
	private UUID registrationUuid;

	@Column(name = "tournamentid", nullable = false)
	private Long tournamentId;

	@Column(name = "tournamentuuid", nullable = false)
	private UUID tournamentUuid;

	@Column(name = "playerid")
	private Long playerId;

	@Column(name = "playeruuid")
	private UUID playerUuid;

	@Column(name = "playername")
	private String playerName;

	@Column(name = "phonenumber")
	private String phoneNumber;

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

	public RegistrationPlayer() {
	}

	public RegistrationPlayer(Long registrationId, UUID registrationUuid, Long tournamentId, UUID tournamentUuid,
			Long playerId, UUID playerUuid, String playerName, String phoneNumber, Long createdBy) {

		this.registrationId = registrationId;
		this.registrationUuid = registrationUuid;
		this.tournamentId = tournamentId;
		this.tournamentUuid = tournamentUuid;
		this.playerId = playerId;
		this.playerUuid = playerUuid;
		this.playerName = playerName;
		this.phoneNumber = phoneNumber;
		this.createdBy = createdBy;
	}

	@PrePersist
	public void prePersist() {
		if (registrationPlayerUuid == null) {
			registrationPlayerUuid = UUID.randomUUID();
		}
	}

	public Long getRegistrationPlayerId() {
		return registrationPlayerId;
	}

	public void setRegistrationPlayerId(Long registrationPlayerId) {
		this.registrationPlayerId = registrationPlayerId;
	}

	public UUID getRegistrationPlayerUuid() {
		return registrationPlayerUuid;
	}

	public void setRegistrationPlayerUuid(UUID registrationPlayerUuid) {
		this.registrationPlayerUuid = registrationPlayerUuid;
	}

	public Long getRegistrationId() {
		return registrationId;
	}

	public void setRegistrationId(Long registrationId) {
		this.registrationId = registrationId;
	}

	public UUID getRegistrationUuid() {
		return registrationUuid;
	}

	public void setRegistrationUuid(UUID registrationUuid) {
		this.registrationUuid = registrationUuid;
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

	public Long getPlayerId() {
		return playerId;
	}

	public void setPlayerId(Long playerId) {
		this.playerId = playerId;
	}

	public UUID getPlayerUuid() {
		return playerUuid;
	}

	public void setPlayerUuid(UUID playerUuid) {
		this.playerUuid = playerUuid;
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
	
	public String getPlayerName() {
		return playerName;
	}

	public void setPlayerName(String playerName) {
		this.playerName = playerName;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;
		if (!(o instanceof RegistrationPlayer))
			return false;
		RegistrationPlayer that = (RegistrationPlayer) o;
		return Objects.equals(registrationPlayerId, that.registrationPlayerId)
				&& Objects.equals(registrationPlayerUuid, that.registrationPlayerUuid);
	}

	@Override
	public int hashCode() {
		return Objects.hash(registrationPlayerId, registrationPlayerUuid);
	}

	@Override
	public String toString() {
		return "RegistrationPlayer [registrationPlayerId=" + registrationPlayerId + ", registrationPlayerUuid="
				+ registrationPlayerUuid + ", registrationId=" + registrationId + ", registrationUuid="
				+ registrationUuid + ", tournamentId=" + tournamentId + ", tournamentUuid=" + tournamentUuid
				+ ", playerId=" + playerId + ", playerUuid=" + playerUuid + ", playerName=" + playerName
				+ ", phoneNumber=" + phoneNumber + ", createdAt=" + createdAt + ", updatedAt=" + updatedAt
				+ ", createdBy=" + createdBy + ", updatedBy=" + updatedBy + "]";
	}
}
