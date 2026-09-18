package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.FacilityBooking;
import com.athlon.identityservice.venue.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FacilityBookingRepository extends JpaRepository<FacilityBooking, Long> {

    Optional<FacilityBooking> findByBookingUuid(UUID bookingUuid);

    Optional<FacilityBooking> findByBookingNumber(String bookingNumber);

    List<FacilityBooking> findByVenueId(Long venueId);

    List<FacilityBooking> findByFacilityId(Long facilityId);

    List<FacilityBooking> findByFacilityIdAndBookingDate(Long facilityId, LocalDate bookingDate);

    List<FacilityBooking> findByFacilityIdAndBookingDateBetween(Long facilityId, LocalDate startDate, LocalDate endDate);

    List<FacilityBooking> findByVenueIdAndBookingDateBetween(Long venueId, LocalDate startDate, LocalDate endDate);

    List<FacilityBooking> findByCustomerUserUuidOrderByBookingDateDescStartTimeDesc(UUID customerUserUuid);

    List<FacilityBooking> findByCustomerUserIdOrderByBookingDateDescStartTimeDesc(Long customerUserId);

    List<FacilityBooking> findByVenueIdAndBookingStatusIn(Long venueId, Collection<BookingStatus> statuses);

    @Query("SELECT b FROM FacilityBooking b WHERE b.facilityId = :facilityId " +
           "AND b.bookingDate = :bookingDate " +
           "AND b.bookingStatus NOT IN ('CANCELLED', 'NO_SHOW') " +
           "AND (b.bookingStatus != 'HELD' OR b.holdExpiresAt IS NULL OR b.holdExpiresAt > CURRENT_TIMESTAMP) " +
           "AND (b.startTime < :endTime AND b.endTime > :startTime)")
    List<FacilityBooking> findOverlappingBookings(
            @Param("facilityId") Long facilityId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    @Query("SELECT b FROM FacilityBooking b WHERE b.facilityId = :facilityId " +
           "AND b.bookingDate = :bookingDate " +
           "AND b.bookingId != :excludeBookingId " +
           "AND b.bookingStatus NOT IN ('CANCELLED', 'NO_SHOW') " +
           "AND (b.bookingStatus != 'HELD' OR b.holdExpiresAt IS NULL OR b.holdExpiresAt > CURRENT_TIMESTAMP) " +
           "AND (b.startTime < :endTime AND b.endTime > :startTime)")
    List<FacilityBooking> findOverlappingBookingsExcluding(
            @Param("facilityId") Long facilityId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeBookingId") Long excludeBookingId
    );
}
