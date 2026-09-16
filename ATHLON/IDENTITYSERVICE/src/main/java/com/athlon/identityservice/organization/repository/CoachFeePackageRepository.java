package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.CoachFeePackage;

@Repository
public interface CoachFeePackageRepository extends JpaRepository<CoachFeePackage, Long> {

    Optional<CoachFeePackage> findByPackageUuid(UUID packageUuid);

    List<CoachFeePackage> findByOrganizationUuidOrderByCreatedAtDesc(UUID organizationUuid);

    List<CoachFeePackage> findByOrganizationUuidAndActiveOrderByCreatedAtDesc(UUID organizationUuid, Boolean active);

    long countByOrganizationUuid(UUID organizationUuid);

    long countByOrganizationUuidAndActive(UUID organizationUuid, Boolean active);

    void deleteByPackageUuid(UUID packageUuid);
}
