package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.FacilityBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FacilityBlockRepository extends JpaRepository<FacilityBlock, Long> {

    Optional<FacilityBlock> findByBlockUuid(UUID blockUuid);

    List<FacilityBlock> findByVenueId(Long venueId);

    List<FacilityBlock> findByFacilityId(Long facilityId);

    List<FacilityBlock> findByFacilityIdAndBlockDate(Long facilityId, LocalDate blockDate);

    List<FacilityBlock> findByFacilityIdAndBlockDateBetween(Long facilityId, LocalDate startDate, LocalDate endDate);

    List<FacilityBlock> findByVenueIdAndBlockDateBetween(Long venueId, LocalDate startDate, LocalDate endDate);
}
