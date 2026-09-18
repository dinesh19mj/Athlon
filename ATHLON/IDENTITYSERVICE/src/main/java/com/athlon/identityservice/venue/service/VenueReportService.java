package com.athlon.identityservice.venue.service;

import com.athlon.identityservice.venue.dto.VenueReportSummaryDto;
import com.athlon.identityservice.venue.entity.FacilityBooking;
import com.athlon.identityservice.venue.entity.Venue;
import com.athlon.identityservice.venue.entity.VenueFacility;
import com.athlon.identityservice.venue.enums.BookingStatus;
import com.athlon.identityservice.venue.enums.PaymentStatus;
import com.athlon.identityservice.venue.repository.FacilityBookingRepository;
import com.athlon.identityservice.venue.repository.VenueFacilityRepository;
import com.athlon.identityservice.venue.repository.VenueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VenueReportService {

    private final FacilityBookingRepository bookingRepository;
    private final VenueRepository venueRepository;
    private final VenueFacilityRepository facilityRepository;

    public VenueReportService(
            FacilityBookingRepository bookingRepository,
            VenueRepository venueRepository,
            VenueFacilityRepository facilityRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.venueRepository = venueRepository;
        this.facilityRepository = facilityRepository;
    }

    @Transactional(readOnly = true)
    public VenueReportSummaryDto getVenueReportSummary(Long venueId, LocalDate startDate, LocalDate endDate) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + venueId));

        if (startDate == null) startDate = LocalDate.now().minusDays(30);
        if (endDate == null) endDate = LocalDate.now();

        List<FacilityBooking> bookings = bookingRepository.findByVenueIdAndBookingDateBetween(venueId, startDate, endDate);
        List<VenueFacility> facilities = facilityRepository.findByVenueId(venueId);

        long totalBookings = bookings.size();
        long confirmedBookings = bookings.stream().filter(b -> b.getBookingStatus() != BookingStatus.CANCELLED && b.getBookingStatus() != BookingStatus.NO_SHOW).count();
        long cancelledBookings = bookings.stream().filter(b -> b.getBookingStatus() == BookingStatus.CANCELLED).count();

        BigDecimal totalRevenue = bookings.stream()
                .filter(b -> b.getBookingStatus() != BookingStatus.CANCELLED)
                .map(FacilityBooking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal paidRevenue = bookings.stream()
                .filter(b -> b.getPaymentStatus() == PaymentStatus.PAID && b.getBookingStatus() != BookingStatus.CANCELLED)
                .map(FacilityBooking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingRevenue = totalRevenue.subtract(paidRevenue);

        // Bookings by Sport
        Map<String, Long> bookingsBySport = bookings.stream()
                .filter(b -> b.getSportName() != null && !b.getSportName().isEmpty())
                .collect(Collectors.groupingBy(FacilityBooking::getSportName, Collectors.counting()));

        // Bookings by Source
        Map<String, Long> bookingsBySource = bookings.stream()
                .filter(b -> b.getBookingSource() != null)
                .collect(Collectors.groupingBy(b -> b.getBookingSource().name(), Collectors.counting()));

        // Facility Performance
        List<VenueReportSummaryDto.FacilityPerformanceDto> perfList = new ArrayList<>();
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;

        for (VenueFacility fac : facilities) {
            List<FacilityBooking> facBookings = bookings.stream()
                    .filter(b -> b.getFacilityId().equals(fac.getFacilityId()) && b.getBookingStatus() != BookingStatus.CANCELLED)
                    .collect(Collectors.toList());

            long facTotal = facBookings.size();
            BigDecimal facRevenue = facBookings.stream()
                    .map(FacilityBooking::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Approximate utilization: total booked minutes vs available minutes (assuming 12h open per day)
            long bookedMinutes = facBookings.stream().mapToLong(FacilityBooking::getDurationMinutes).sum();
            long totalAvailableMinutes = daysBetween * 12 * 60;
            double utilization = totalAvailableMinutes > 0 ? ((double) bookedMinutes / totalAvailableMinutes) * 100 : 0.0;
            utilization = Math.min(100.0, Math.round(utilization * 10.0) / 10.0);

            perfList.add(new VenueReportSummaryDto.FacilityPerformanceDto(
                    fac.getFacilityId(),
                    fac.getName(),
                    facTotal,
                    facRevenue,
                    utilization
            ));
        }

        double avgUtil = perfList.isEmpty() ? 0.0 :
                perfList.stream().mapToDouble(VenueReportSummaryDto.FacilityPerformanceDto::getUtilizationPercentage).average().orElse(0.0);
        avgUtil = Math.round(avgUtil * 10.0) / 10.0;

        VenueReportSummaryDto summary = new VenueReportSummaryDto();
        summary.setVenueId(venue.getVenueId());
        summary.setVenueName(venue.getName());
        summary.setTotalBookings(totalBookings);
        summary.setConfirmedBookings(confirmedBookings);
        summary.setCancelledBookings(cancelledBookings);
        summary.setTotalRevenue(totalRevenue);
        summary.setPaidRevenue(paidRevenue);
        summary.setPendingRevenue(pendingRevenue);
        summary.setAverageUtilizationPercentage(avgUtil);
        summary.setBookingsBySport(bookingsBySport);
        summary.setBookingsBySource(bookingsBySource);
        summary.setFacilityPerformances(perfList);

        return summary;
    }
}
