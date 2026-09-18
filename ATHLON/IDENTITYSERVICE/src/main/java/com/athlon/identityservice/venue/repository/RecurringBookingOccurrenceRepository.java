package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.RecurringBookingOccurrence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringBookingOccurrenceRepository extends JpaRepository<RecurringBookingOccurrence, Long> {

    List<RecurringBookingOccurrence> findByRecurringBookingId(Long recurringBookingId);

    List<RecurringBookingOccurrence> findByOccurrenceDate(LocalDate occurrenceDate);

    List<RecurringBookingOccurrence> findByRecurringBookingIdAndOccurrenceDateBetween(Long recurringBookingId, LocalDate startDate, LocalDate endDate);
}
