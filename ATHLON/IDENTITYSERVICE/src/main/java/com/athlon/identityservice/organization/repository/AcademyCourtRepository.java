package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.AcademyCourt;

@Repository
public interface AcademyCourtRepository extends JpaRepository<AcademyCourt, Long> {

    Optional<AcademyCourt> findByCourtUuid(UUID courtUuid);

    List<AcademyCourt> findByOrganizationUuidOrderByCreatedAtDesc(UUID organizationUuid);

    List<AcademyCourt> findByOrganizationUuidAndStatusOrderByCreatedAtDesc(UUID organizationUuid, String status);

    void deleteByCourtUuid(UUID courtUuid);
}
