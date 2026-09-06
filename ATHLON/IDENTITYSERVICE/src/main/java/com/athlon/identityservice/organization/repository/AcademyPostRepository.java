package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.AcademyPost;

@Repository
public interface AcademyPostRepository extends JpaRepository<AcademyPost, Long> {

    Optional<AcademyPost> findByPostUuid(UUID postUuid);

    List<AcademyPost> findByOrganizationUuidOrderByIsPinnedDescCreatedAtDesc(UUID organizationUuid);

    List<AcademyPost> findByOrganizationUuidAndPostTypeOrderByIsPinnedDescCreatedAtDesc(UUID organizationUuid, String postType);

    List<AcademyPost> findByOrganizationUuidAndTargetScopeOrderByIsPinnedDescCreatedAtDesc(UUID organizationUuid, String targetScope);

    List<AcademyPost> findByOrganizationUuidAndBatchUuidOrderByIsPinnedDescCreatedAtDesc(UUID organizationUuid, UUID batchUuid);

    List<AcademyPost> findByOrganizationUuidAndCentreUuidOrderByIsPinnedDescCreatedAtDesc(UUID organizationUuid, UUID centreUuid);
}
