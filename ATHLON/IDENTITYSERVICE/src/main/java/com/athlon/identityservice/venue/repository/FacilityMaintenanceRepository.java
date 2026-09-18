package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.FacilityMaintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FacilityMaintenanceRepository extends JpaRepository<FacilityMaintenance, Long> {

    Optional<FacilityMaintenance> findByMaintenanceUuid(UUID maintenanceUuid);

    List<FacilityMaintenance> findByFacilityId(Long facilityId);

    List<FacilityMaintenance> findByFacilityIdAndStatus(Long facilityId, String status);

    @Query("SELECT m FROM FacilityMaintenance m WHERE m.facilityId = :facilityId " +
           "AND m.status NOT IN ('CANCELLED', 'COMPLETED') " +
           "AND (m.startDateTime < :endDateTime AND m.endDateTime > :startDateTime)")
    List<FacilityMaintenance> findOverlappingMaintenance(
            @Param("facilityId") Long facilityId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );
}
