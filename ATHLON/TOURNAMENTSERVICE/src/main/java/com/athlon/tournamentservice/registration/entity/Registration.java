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
@Table(name = "tournament_registrations")
public class Registration {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "registrationid", updatable = false, nullable = false)
    private Long registrationId;

    @Column(name = "registrationuuid", updatable = false, nullable = false, unique = true)
    private UUID registrationUuid;

    @Column(name = "tournamentid", nullable = false)
    private Long tournamentId;

    @Column(name = "tournamentuuid", nullable = false)
    private UUID tournamentUuid;

    @Column(name = "categoryid")
    private Long categoryId;

    @Column(name = "categoryuuid")
    private UUID categoryUuid;

    @Column(name = "primarycontactid")
    private Long primaryContactId;

    @Column(name = "primarycontactuuid")
    private UUID primaryContactUuid;

    @Column(name = "teamname")
    private String teamName;

    @Column(name = "place")
    private String place;

    @Column(name = "status")
    private String status = "PENDING";

    @Column(name = "paymentstatus")
    private String paymentStatus = "PENDING";

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

    public Registration() {
    }

    public Registration(Long tournamentId,
                        UUID tournamentUuid,
                        Long categoryId,
                        UUID categoryUuid,
                        String teamName,
                        Long primaryContactId,
                        UUID primaryContactUuid,
                        Long createdBy) {

        this.tournamentId = tournamentId;
        this.tournamentUuid = tournamentUuid;
        this.categoryId = categoryId;
        this.categoryUuid = categoryUuid;
        this.teamName = teamName;
        this.primaryContactId = primaryContactId;
        this.primaryContactUuid = primaryContactUuid;
        this.createdBy = createdBy;
        this.status = "PENDING";
        this.paymentStatus = "PENDING";
    }

    @PrePersist
    public void prePersist() {

        if (registrationUuid == null) {
            registrationUuid = UUID.randomUUID();
        }

        if (status == null) {
            status = "PENDING";
        }

        if (paymentStatus == null) {
            paymentStatus = "PENDING";
        }
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

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public UUID getCategoryUuid() {
        return categoryUuid;
    }

    public void setCategoryUuid(UUID categoryUuid) {
        this.categoryUuid = categoryUuid;
    }

    public Long getPrimaryContactId() {
        return primaryContactId;
    }

    public void setPrimaryContactId(Long primaryContactId) {
        this.primaryContactId = primaryContactId;
    }

    public UUID getPrimaryContactUuid() {
        return primaryContactUuid;
    }

    public void setPrimaryContactUuid(UUID primaryContactUuid) {
        this.primaryContactUuid = primaryContactUuid;
    }

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getPlace() {
        return place;
    }

    public void setPlace(String place) {
        this.place = place;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
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
        if (this == o) return true;
        if (!(o instanceof Registration)) return false;
        Registration that = (Registration) o;
        return Objects.equals(registrationId, that.registrationId) &&
               Objects.equals(registrationUuid, that.registrationUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(registrationId, registrationUuid);
    }

    @Override
    public String toString() {
        return "Registration{" +
                "registrationId=" + registrationId +
                ", registrationUuid=" + registrationUuid +
                ", tournamentId=" + tournamentId +
                ", tournamentUuid=" + tournamentUuid +
                ", teamName='" + teamName + '\'' +
                ", place='" + place + '\'' +
                ", status='" + status + '\'' +
                ", paymentStatus='" + paymentStatus + '\'' +
                '}';
    }
}

