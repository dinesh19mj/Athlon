package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.BookingPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingPaymentRepository extends JpaRepository<BookingPayment, Long> {
    Optional<BookingPayment> findByPaymentUuid(UUID paymentUuid);
    List<BookingPayment> findByBookingIdOrderByPaidAtAsc(Long bookingId);
}
