package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.Venue;
import com.athlon.identityservice.venue.enums.VenueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {

    Optional<Venue> findByVenueUuid(UUID venueUuid);

    List<Venue> findByOrganizationId(Long organizationId);

    List<Venue> findByOrganizationUuid(UUID organizationUuid);

    List<Venue> findByStatus(VenueStatus status);

    List<Venue> findByCityIgnoreCase(String city);
}
