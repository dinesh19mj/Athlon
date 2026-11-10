package com.athlon.identityservice.subscription.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class OrganizerCreditWalletDto {

    private Long accountId;
    private Long organizationId;
    private String organizationUuid;
    private String organizationName;
    private String activeTierCode;
    private String activeTierName;
    private Integer tournamentCreditsAvailable;
    private Integer tournamentCreditsReserved;
    private Integer auctionCreditsAvailable;
    private Integer auctionCreditsReserved;
    private Map<String, Integer> tierLimits;
    private Map<String, Boolean> tierFeatures;
    private List<CreditGrantSummaryDto> activeGrants;
    private LocalDateTime updatedAt;

    public OrganizerCreditWalletDto() {
    }

    public static class CreditGrantSummaryDto {
        private Long grantId;
        private String creditType;
        private Integer initialQuantity;
        private Integer remainingQuantity;
        private String sourceType;
        private LocalDateTime expiresAt;
        private String status;

        public CreditGrantSummaryDto() {
        }

        public Long getGrantId() {
            return grantId;
        }

        public void setGrantId(Long grantId) {
            this.grantId = grantId;
        }

        public String getCreditType() {
            return creditType;
        }

        public void setCreditType(String creditType) {
            this.creditType = creditType;
        }

        public Integer getInitialQuantity() {
            return initialQuantity;
        }

        public void setInitialQuantity(Integer initialQuantity) {
            this.initialQuantity = initialQuantity;
        }

        public Integer getRemainingQuantity() {
            return remainingQuantity;
        }

        public void setRemainingQuantity(Integer remainingQuantity) {
            this.remainingQuantity = remainingQuantity;
        }

        public String getSourceType() {
            return sourceType;
        }

        public void setSourceType(String sourceType) {
            this.sourceType = sourceType;
        }

        public LocalDateTime getExpiresAt() {
            return expiresAt;
        }

        public void setExpiresAt(LocalDateTime expiresAt) {
            this.expiresAt = expiresAt;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(String organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getActiveTierCode() {
        return activeTierCode;
    }

    public void setActiveTierCode(String activeTierCode) {
        this.activeTierCode = activeTierCode;
    }

    public String getActiveTierName() {
        return activeTierName;
    }

    public void setActiveTierName(String activeTierName) {
        this.activeTierName = activeTierName;
    }

    public Integer getTournamentCreditsAvailable() {
        return tournamentCreditsAvailable;
    }

    public void setTournamentCreditsAvailable(Integer tournamentCreditsAvailable) {
        this.tournamentCreditsAvailable = tournamentCreditsAvailable;
    }

    public Integer getTournamentCreditsReserved() {
        return tournamentCreditsReserved;
    }

    public void setTournamentCreditsReserved(Integer tournamentCreditsReserved) {
        this.tournamentCreditsReserved = tournamentCreditsReserved;
    }

    public Integer getAuctionCreditsAvailable() {
        return auctionCreditsAvailable;
    }

    public void setAuctionCreditsAvailable(Integer auctionCreditsAvailable) {
        this.auctionCreditsAvailable = auctionCreditsAvailable;
    }

    public Integer getAuctionCreditsReserved() {
        return auctionCreditsReserved;
    }

    public void setAuctionCreditsReserved(Integer auctionCreditsReserved) {
        this.auctionCreditsReserved = auctionCreditsReserved;
    }

    public Map<String, Integer> getTierLimits() {
        return tierLimits;
    }

    public void setTierLimits(Map<String, Integer> tierLimits) {
        this.tierLimits = tierLimits;
    }

    public Map<String, Boolean> getTierFeatures() {
        return tierFeatures;
    }

    public void setTierFeatures(Map<String, Boolean> tierFeatures) {
        this.tierFeatures = tierFeatures;
    }

    public List<CreditGrantSummaryDto> getActiveGrants() {
        return activeGrants;
    }

    public void setActiveGrants(List<CreditGrantSummaryDto> activeGrants) {
        this.activeGrants = activeGrants;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

