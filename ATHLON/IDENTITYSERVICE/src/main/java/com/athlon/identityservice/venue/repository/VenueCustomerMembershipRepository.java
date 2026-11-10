package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.VenueCustomerMembership;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VenueCustomerMembershipRepository extends JpaRepository<VenueCustomerMembership, Long> {

    Optional<VenueCustomerMembership> findByCustomerMembershipUuid(UUID customerMembershipUuid);

    List<VenueCustomerMembership> findByCustomerUuidAndStatus(UUID customerUuid, String status);

    List<VenueCustomerMembership> findByCustomerIdAndStatus(Long customerId, String status);

    List<VenueCustomerMembership> findByOrganizationUuidOrderByCreatedAtDesc(UUID organizationUuid);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM VenueCustomerMembership m WHERE m.customerMembershipId = :id")
    Optional<VenueCustomerMembership> findByIdForUpdate(@Param("id") Long id);
}

