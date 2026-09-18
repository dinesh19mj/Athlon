package com.athlon.identityservice.venue.dto;

import com.athlon.identityservice.venue.enums.RecurrenceType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class RecurringBookingDto {
    private Long recurringBookingId;
    private UUID recurringBookingUuid;
    private String bookingNumber;
    private Long venueId;
    private String venueName;
    private Long facilityId;
    private String facilityName;
    private Long customerUserId;
    private UUID customerUserUuid;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private RecurrenceType recurrenceType;
    private String daysOfWeek;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer totalSessions;
    private BigDecimal pricePerSession;
    private BigDecimal totalAmount;
    private String status;
    private String notes;
    private List<OccurrenceDto> occurrences;
    private LocalDateTime createdAt;

    public static class OccurrenceDto {
        private Long occurrenceId;
        private Long bookingId;
        private LocalDate occurrenceDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private String status;
        private BigDecimal price;
        private Boolean isPaid;

        public OccurrenceDto() {}

        public Long getOccurrenceId() { return occurrenceId; }
        public void setOccurrenceId(Long occurrenceId) { this.occurrenceId = occurrenceId; }
        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public LocalDate getOccurrenceDate() { return occurrenceDate; }
        public void setOccurrenceDate(LocalDate occurrenceDate) { this.occurrenceDate = occurrenceDate; }
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public Boolean getIsPaid() { return isPaid; }
        public void setIsPaid(Boolean isPaid) { this.isPaid = isPaid; }
    }

    public RecurringBookingDto() {}

    public Long getRecurringBookingId() { return recurringBookingId; }
    public void setRecurringBookingId(Long recurringBookingId) { this.recurringBookingId = recurringBookingId; }
    public UUID getRecurringBookingUuid() { return recurringBookingUuid; }
    public void setRecurringBookingUuid(UUID recurringBookingUuid) { this.recurringBookingUuid = recurringBookingUuid; }
    public String getBookingNumber() { return bookingNumber; }
    public void setBookingNumber(String bookingNumber) { this.bookingNumber = bookingNumber; }
    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }
    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
    public Long getCustomerUserId() { return customerUserId; }
    public void setCustomerUserId(Long customerUserId) { this.customerUserId = customerUserId; }
    public UUID getCustomerUserUuid() { return customerUserUuid; }
    public void setCustomerUserUuid(UUID customerUserUuid) { this.customerUserUuid = customerUserUuid; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public RecurrenceType getRecurrenceType() { return recurrenceType; }
    public void setRecurrenceType(RecurrenceType recurrenceType) { this.recurrenceType = recurrenceType; }
    public String getDaysOfWeek() { return daysOfWeek; }
    public void setDaysOfWeek(String daysOfWeek) { this.daysOfWeek = daysOfWeek; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public Integer getTotalSessions() { return totalSessions; }
    public void setTotalSessions(Integer totalSessions) { this.totalSessions = totalSessions; }
    public BigDecimal getPricePerSession() { return pricePerSession; }
    public void setPricePerSession(BigDecimal pricePerSession) { this.pricePerSession = pricePerSession; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<OccurrenceDto> getOccurrences() { return occurrences; }
    public void setOccurrences(List<OccurrenceDto> occurrences) { this.occurrences = occurrences; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
