package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.CoachTrainee;

@Repository
public interface CoachTraineeRepository extends JpaRepository<CoachTrainee, Long> {

    Optional<CoachTrainee> findByTraineeUuid(UUID traineeUuid);

    List<CoachTrainee> findByOrganizationUuidOrderByCreatedAtDesc(UUID organizationUuid);

    List<CoachTrainee> findByOrganizationUuidAndStatusOrderByCreatedAtDesc(UUID organizationUuid, String status);

    long countByOrganizationUuid(UUID organizationUuid);

    long countByOrganizationUuidAndStatus(UUID organizationUuid, String status);

    long countByOrganizationUuidAndPackageUuid(UUID organizationUuid, UUID packageUuid);

    void deleteByTraineeUuid(UUID traineeUuid);
}
