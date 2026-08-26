package com.athlon.tournamentservice.teamchampionship.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "championship_team_registrations")
public class ChampionshipTeamRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_id", updatable = false, nullable = false)
    private Long teamId;

    @Column(name = "team_uuid", updatable = false, nullable = false, unique = true)
    private UUID teamUuid;

    @Column(name = "championship_id", nullable = false)
    private Long championshipId;

    @Column(name = "championship_uuid", nullable = false)
    private UUID championshipUuid;

    @Column(name = "team_name", nullable = false)
    private String teamName;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "owner_user_id")
    private Long ownerUserId;

    @Column(name = "owner_user_uuid")
    private UUID ownerUserUuid;

    @Column(name = "captain_name")
    private String captainName;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "status")
    private String status = "APPROVED"; // "PENDING", "APPROVED", "REJECTED"

    @Column(name = "payment_status")
    private String paymentStatus = "PENDING"; // "PENDING", "PAID", "WAIVED"

    @Column(name = "payment_amount")
    private Double paymentAmount = 0.0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.teamUuid == null) {
            this.teamUuid = UUID.randomUUID();
        }
        if (this.status == null) this.status = "APPROVED";
        if (this.paymentStatus == null) this.paymentStatus = "PENDING";
        if (this.paymentAmount == null) this.paymentAmount = 0.0;
    }

    public ChampionshipTeamRegistration() {}

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public UUID getTeamUuid() {
        return teamUuid;
    }

    public void setTeamUuid(UUID teamUuid) {
        this.teamUuid = teamUuid;
    }

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

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public Long getOwnerUserId() {
        return ownerUserId;
    }

    public void setOwnerUserId(Long ownerUserId) {
        this.ownerUserId = ownerUserId;
    }

    public UUID getOwnerUserUuid() {
        return ownerUserUuid;
    }

    public void setOwnerUserUuid(UUID ownerUserUuid) {
        this.ownerUserUuid = ownerUserUuid;
    }

    public String getCaptainName() {
        return captainName;
    }

    public void setCaptainName(String captainName) {
        this.captainName = captainName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
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

    public Double getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(Double paymentAmount) {
        this.paymentAmount = paymentAmount;
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
