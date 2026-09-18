package com.athlon.identityservice.venue.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class VenueReportSummaryDto {
    private Long venueId;
    private String venueName;
    private Long totalBookings;
    private Long confirmedBookings;
    private Long cancelledBookings;
    private BigDecimal totalRevenue;
    private BigDecimal paidRevenue;
    private BigDecimal pendingRevenue;
    private Double averageUtilizationPercentage;
    private Map<String, Long> bookingsBySport;
    private Map<String, Long> bookingsBySource;
    private List<FacilityPerformanceDto> facilityPerformances;

    public static class FacilityPerformanceDto {
        private Long facilityId;
        private String facilityName;
        private Long totalBookings;
        private BigDecimal revenue;
        private Double utilizationPercentage;

        public FacilityPerformanceDto() {}
        public FacilityPerformanceDto(Long facilityId, String facilityName, Long totalBookings, BigDecimal revenue, Double utilizationPercentage) {
            this.facilityId = facilityId;
            this.facilityName = facilityName;
            this.totalBookings = totalBookings;
            this.revenue = revenue;
            this.utilizationPercentage = utilizationPercentage;
        }

        public Long getFacilityId() { return facilityId; }
        public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
        public String getFacilityName() { return facilityName; }
        public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
        public Long getTotalBookings() { return totalBookings; }
        public void setTotalBookings(Long totalBookings) { this.totalBookings = totalBookings; }
        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
        public Double getUtilizationPercentage() { return utilizationPercentage; }
        public void setUtilizationPercentage(Double utilizationPercentage) { this.utilizationPercentage = utilizationPercentage; }
    }

    public VenueReportSummaryDto() {}

    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }
    public Long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(Long totalBookings) { this.totalBookings = totalBookings; }
    public Long getConfirmedBookings() { return confirmedBookings; }
    public void setConfirmedBookings(Long confirmedBookings) { this.confirmedBookings = confirmedBookings; }
    public Long getCancelledBookings() { return cancelledBookings; }
    public void setCancelledBookings(Long cancelledBookings) { this.cancelledBookings = cancelledBookings; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public BigDecimal getPaidRevenue() { return paidRevenue; }
    public void setPaidRevenue(BigDecimal paidRevenue) { this.paidRevenue = paidRevenue; }
    public BigDecimal getPendingRevenue() { return pendingRevenue; }
    public void setPendingRevenue(BigDecimal pendingRevenue) { this.pendingRevenue = pendingRevenue; }
    public Double getAverageUtilizationPercentage() { return averageUtilizationPercentage; }
    public void setAverageUtilizationPercentage(Double averageUtilizationPercentage) { this.averageUtilizationPercentage = averageUtilizationPercentage; }
    public Map<String, Long> getBookingsBySport() { return bookingsBySport; }
    public void setBookingsBySport(Map<String, Long> bookingsBySport) { this.bookingsBySport = bookingsBySport; }
    public Map<String, Long> getBookingsBySource() { return bookingsBySource; }
    public void setBookingsBySource(Map<String, Long> bookingsBySource) { this.bookingsBySource = bookingsBySource; }
    public List<FacilityPerformanceDto> getFacilityPerformances() { return facilityPerformances; }
    public void setFacilityPerformances(List<FacilityPerformanceDto> facilityPerformances) { this.facilityPerformances = facilityPerformances; }
}
