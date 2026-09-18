package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.VenueFacility;
import com.athlon.identityservice.venue.enums.FacilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VenueFacilityRepository extends JpaRepository<VenueFacility, Long> {

    Optional<VenueFacility> findByFacilityUuid(UUID facilityUuid);

    List<VenueFacility> findByVenueId(Long venueId);

    List<VenueFacility> findByVenueUuid(UUID venueUuid);

    List<VenueFacility> findByVenueIdAndStatus(Long venueId, FacilityStatus status);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT f FROM VenueFacility f WHERE f.facilityId = :facilityId")
    Optional<VenueFacility> findByIdForUpdate(@org.springframework.data.repository.query.Param("facilityId") Long facilityId);
}
