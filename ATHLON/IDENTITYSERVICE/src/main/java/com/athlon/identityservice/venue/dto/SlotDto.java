package com.athlon.identityservice.venue.dto;

import com.athlon.identityservice.venue.enums.PricingType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class SlotDto {
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isAvailable;
    private String status; // AVAILABLE, BOOKED, HELD, BLOCKED, MAINTENANCE, RESERVED, CLOSED
    private BigDecimal price;
    private PricingType pricingType;
    private String reason;
    private UUID bookingUuid;
    private String bookingNumber;
    private UUID blockUuid;
    private String customerName;
    private String sportName;

    public SlotDto() {}

    public SlotDto(LocalTime startTime, LocalTime endTime, Boolean isAvailable, String status, BigDecimal price, PricingType pricingType) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.isAvailable = isAvailable;
        this.status = status;
        this.price = price;
        this.pricingType = pricingType;
    }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public PricingType getPricingType() { return pricingType; }
    public void setPricingType(PricingType pricingType) { this.pricingType = pricingType; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public UUID getBookingUuid() { return bookingUuid; }
    public void setBookingUuid(UUID bookingUuid) { this.bookingUuid = bookingUuid; }
    public String getBookingNumber() { return bookingNumber; }
    public void setBookingNumber(String bookingNumber) { this.bookingNumber = bookingNumber; }
    public UUID getBlockUuid() { return blockUuid; }
    public void setBlockUuid(UUID blockUuid) { this.blockUuid = blockUuid; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getSportName() { return sportName; }
    public void setSportName(String sportName) { this.sportName = sportName; }
}
