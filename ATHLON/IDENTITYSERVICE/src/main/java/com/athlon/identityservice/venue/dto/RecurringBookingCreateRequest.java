package com.athlon.identityservice.venue.dto;

import com.athlon.identityservice.venue.enums.RecurrenceType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class RecurringBookingCreateRequest {
    private Long venueId;
    private Long facilityId;
    private Long customerUserId;
    private UUID customerUserUuid;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private RecurrenceType recurrenceType = RecurrenceType.WEEKLY;
    private String daysOfWeek;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal pricePerSession;
    private String notes;

    public RecurringBookingCreateRequest() {}

    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
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
    public BigDecimal getPricePerSession() { return pricePerSession; }
    public void setPricePerSession(BigDecimal pricePerSession) { this.pricePerSession = pricePerSession; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
