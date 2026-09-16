package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.ClubPost;

@Repository
public interface ClubPostRepository extends JpaRepository<ClubPost, Long> {

    Optional<ClubPost> findByPostUuid(UUID postUuid);

    List<ClubPost> findByOrganizationUuidOrderByIsPinnedDescCreatedAtDesc(UUID organizationUuid);

    List<ClubPost> findByOrganizationUuidAndApprovalStatusOrderByIsPinnedDescCreatedAtDesc(UUID organizationUuid, String approvalStatus);

    List<ClubPost> findByOrganizationUuidAndPostTypeOrderByIsPinnedDescCreatedAtDesc(UUID organizationUuid, String postType);

    List<ClubPost> findByOrganizationUuidAndApprovalStatusAndPostTypeOrderByIsPinnedDescCreatedAtDesc(UUID organizationUuid, String approvalStatus, String postType);

    List<ClubPost> findByOrganizationUuidAndTargetScopeOrderByIsPinnedDescCreatedAtDesc(UUID organizationUuid, String targetScope);

    long countByOrganizationUuidAndApprovalStatus(UUID organizationUuid, String approvalStatus);
}
