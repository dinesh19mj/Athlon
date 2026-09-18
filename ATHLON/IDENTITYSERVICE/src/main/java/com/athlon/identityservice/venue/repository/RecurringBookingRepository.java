package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.RecurringBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecurringBookingRepository extends JpaRepository<RecurringBooking, Long> {

    Optional<RecurringBooking> findByRecurringBookingUuid(UUID uuid);

    Optional<RecurringBooking> findByBookingNumber(String bookingNumber);

    List<RecurringBooking> findByVenueId(Long venueId);

    List<RecurringBooking> findByFacilityId(Long facilityId);

    List<RecurringBooking> findByCustomerUserUuid(UUID customerUserUuid);

    List<RecurringBooking> findByCustomerUserId(Long customerUserId);
}
