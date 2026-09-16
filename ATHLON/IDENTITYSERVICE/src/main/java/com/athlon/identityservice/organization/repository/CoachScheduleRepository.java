package com.athlon.identityservice.organization.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.CoachSchedule;

@Repository
public interface CoachScheduleRepository extends JpaRepository<CoachSchedule, Long> {

    Optional<CoachSchedule> findBySessionUuid(UUID sessionUuid);

    List<CoachSchedule> findByOrganizationUuidOrderBySessionDateAscCreatedAtAsc(UUID organizationUuid);

    List<CoachSchedule> findByOrganizationUuidAndSessionDateOrderByCreatedAtAsc(UUID organizationUuid, LocalDate sessionDate);

    List<CoachSchedule> findByOrganizationUuidAndSessionDateAndStatus(UUID organizationUuid, LocalDate sessionDate, String status);

    long countByOrganizationUuidAndSessionDate(UUID organizationUuid, LocalDate sessionDate);

    @Query("SELECT COUNT(c) FROM CoachSchedule c WHERE c.organizationUuid = :organizationUuid AND c.sessionDate = :sessionDate AND c.isCheckedIn = :isCheckedIn")
    long countByOrganizationUuidAndSessionDateAndIsCheckedIn(
            @Param("organizationUuid") UUID organizationUuid,
            @Param("sessionDate") LocalDate sessionDate,
            @Param("isCheckedIn") Boolean isCheckedIn);

    void deleteBySessionUuid(UUID sessionUuid);
}
