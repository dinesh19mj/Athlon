package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.RecurringReservation;
import com.athlon.identityservice.venue.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecurringReservationRepository extends JpaRepository<RecurringReservation, Long> {

    Optional<RecurringReservation> findByRecurringReservationUuid(UUID uuid);

    List<RecurringReservation> findByVenueId(Long venueId);

    List<RecurringReservation> findByFacilityId(Long facilityId);

    List<RecurringReservation> findByFacilityIdAndStatus(Long facilityId, ReservationStatus status);

    List<RecurringReservation> findByVenueIdAndStatus(Long venueId, ReservationStatus status);
}
