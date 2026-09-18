package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.RecurringReservationException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecurringReservationExceptionRepository extends JpaRepository<RecurringReservationException, Long> {

    List<RecurringReservationException> findByRecurringReservationId(Long recurringReservationId);

    Optional<RecurringReservationException> findByRecurringReservationIdAndOccurrenceDate(Long recurringReservationId, LocalDate occurrenceDate);

    List<RecurringReservationException> findByRecurringReservationIdAndOccurrenceDateBetween(Long recurringReservationId, LocalDate startDate, LocalDate endDate);
}
