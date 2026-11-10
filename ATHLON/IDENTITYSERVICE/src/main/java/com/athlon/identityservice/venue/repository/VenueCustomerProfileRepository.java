package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.VenueCustomerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VenueCustomerProfileRepository extends JpaRepository<VenueCustomerProfile, Long> {

    Optional<VenueCustomerProfile> findByCustomerUuid(UUID customerUuid);

    Optional<VenueCustomerProfile> findByOrganizationUuidAndGuestPhone(UUID organizationUuid, String guestPhone);

    Page<VenueCustomerProfile> findByOrganizationUuidOrderByLastBookingAtDesc(UUID organizationUuid, Pageable pageable);

    @Query("SELECT c FROM VenueCustomerProfile c WHERE c.organizationUuid = :orgUuid AND " +
           "(LOWER(c.guestName) LIKE LOWER(CONCAT('%', :q, '%')) OR c.guestPhone LIKE CONCAT('%', :q, '%') OR " +
           "(c.guestEmail IS NOT NULL AND LOWER(c.guestEmail) LIKE LOWER(CONCAT('%', :q, '%')))) " +
           "ORDER BY c.lastBookingAt DESC NULLS LAST")
    Page<VenueCustomerProfile> searchCustomers(@Param("orgUuid") UUID orgUuid, @Param("q") String query, Pageable pageable);

    long countByOrganizationUuid(UUID organizationUuid);

    long countByOrganizationUuidAndVipTier(UUID organizationUuid, String vipTier);
}

