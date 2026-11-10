package com.athlon.identityservice.subscription.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "auction_credit_activations", indexes = {
        @Index(name = "idx_auction_act_tournament_uuid", columnList = "tournament_uuid", unique = true),
        @Index(name = "idx_auction_act_org_id", columnList = "organization_id")
})
public class AuctionCreditActivation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "activation_id", updatable = false, nullable = false)
    private Long activationId;

    @Column(name = "tournament_uuid", nullable = false, unique = true, length = 64)
    private String tournamentUuid;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(name = "account_id", nullable = false)
    private Long accountId;

    @Column(name = "activation_type", nullable = false, length = 32)
    private String activationType = "PURCHASED_CREDIT"; // INCLUDED, PURCHASED_CREDIT, PROMOTIONAL, ADMIN

    @Column(name = "activated_by")
    private Long activatedBy;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "ACTIVE"; // ACTIVE, CANCELLED

    @CreationTimestamp
    @Column(name = "activated_at", updatable = false)
    private LocalDateTime activatedAt;

    public AuctionCreditActivation() {
    }

    public AuctionCreditActivation(String tournamentUuid, Long organizationId, Long accountId,
                                   String activationType, Long activatedBy) {
        this.tournamentUuid = tournamentUuid;
        this.organizationId = organizationId;
        this.accountId = accountId;
        this.activationType = activationType != null ? activationType : "PURCHASED_CREDIT";
        this.activatedBy = activatedBy;
        this.status = "ACTIVE";
    }

    public Long getActivationId() {
        return activationId;
    }

    public void setActivationId(Long activationId) {
        this.activationId = activationId;
    }

    public String getTournamentUuid() {
        return tournamentUuid;
    }

    public void setTournamentUuid(String tournamentUuid) {
        this.tournamentUuid = tournamentUuid;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getActivationType() {
        return activationType;
    }

    public void setActivationType(String activationType) {
        this.activationType = activationType;
    }

    public Long getActivatedBy() {
        return activatedBy;
    }

    public void setActivatedBy(Long activatedBy) {
        this.activatedBy = activatedBy;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getActivatedAt() {
        return activatedAt;
    }
}

