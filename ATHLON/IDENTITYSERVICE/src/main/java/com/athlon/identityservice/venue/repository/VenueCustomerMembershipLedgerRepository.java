package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.VenueCustomerMembershipLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueCustomerMembershipLedgerRepository extends JpaRepository<VenueCustomerMembershipLedger, Long> {

    List<VenueCustomerMembershipLedger> findByCustomerMembershipIdOrderByCreatedAtDesc(Long customerMembershipId);

    List<VenueCustomerMembershipLedger> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<VenueCustomerMembershipLedger> findByBookingId(Long bookingId);
}

