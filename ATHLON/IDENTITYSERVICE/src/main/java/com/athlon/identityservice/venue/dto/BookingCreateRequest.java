package com.athlon.identityservice.venue.dto;

import com.athlon.identityservice.venue.enums.BookingSource;
import com.athlon.identityservice.venue.enums.PaymentMethod;
import com.athlon.identityservice.venue.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class BookingCreateRequest {
    private Long venueId;
    private UUID venueUuid;
    private Long facilityId;
    private UUID facilityUuid;
    private Long customerUserId;
    private UUID customerUserUuid;
    private String guestName;
    private String guestPhone;
    private String guestEmail;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;
    private String sportName;
    private BigDecimal baseAmount;
    private BigDecimal discountAmount = BigDecimal.ZERO;
    private BigDecimal taxAmount = BigDecimal.ZERO;
    private BigDecimal totalAmount;
    private BookingSource bookingSource = BookingSource.ATHLON_APP;
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;
    private PaymentMethod paymentMethod;
    private String transactionReference;
    private BigDecimal paidAmount;
    private String notes;

    public BookingCreateRequest() {}

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
    public String getGuestEmail() { return guestEmail; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }
    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public String getSportName() { return sportName; }
    public void setSportName(String sportName) { this.sportName = sportName; }
    public BigDecimal getBaseAmount() { return baseAmount; }
    public void setBaseAmount(BigDecimal baseAmount) { this.baseAmount = baseAmount; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BookingSource getBookingSource() { return bookingSource; }
    public void setBookingSource(BookingSource bookingSource) { this.bookingSource = bookingSource; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }
    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
