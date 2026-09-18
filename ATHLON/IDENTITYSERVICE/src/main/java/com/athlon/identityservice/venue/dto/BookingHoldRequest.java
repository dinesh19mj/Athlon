package com.athlon.identityservice.venue.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class BookingHoldRequest {
    private Long venueId;
    private UUID venueUuid;
    private Long facilityId;
    private UUID facilityUuid;
    private Long customerUserId;
    private UUID customerUserUuid;
    private String guestName;
    private String guestPhone;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String sportName;
    private Integer holdDurationMinutes = 10; // default 10 min hold

    public BookingHoldRequest() {}

    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public UUID getVenueUuid() { return venueUuid; }
    public void setVenueUuid(UUID venueUuid) { this.venueUuid = venueUuid; }
    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
    public UUID getFacilityUuid() { return facilityUuid; }
    public void setFacilityUuid(UUID facilityUuid) { this.facilityUuid = facilityUuid; }
    public Long getCustomerUserId() { return customerUserId; }
    public void setCustomerUserId(Long customerUserId) { this.customerUserId = customerUserId; }
    public UUID getCustomerUserUuid() { return customerUserUuid; }
    public void setCustomerUserUuid(UUID customerUserUuid) { this.customerUserUuid = customerUserUuid; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public String getGuestPhone() { return guestPhone; }
    public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }
    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public String getSportName() { return sportName; }
    public void setSportName(String sportName) { this.sportName = sportName; }
    public Integer getHoldDurationMinutes() { return holdDurationMinutes; }
    public void setHoldDurationMinutes(Integer holdDurationMinutes) { this.holdDurationMinutes = holdDurationMinutes; }
}
