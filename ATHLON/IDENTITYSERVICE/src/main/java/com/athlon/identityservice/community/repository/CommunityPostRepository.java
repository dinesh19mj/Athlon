package com.athlon.identityservice.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.community.entity.CommunityPost;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    List<CommunityPost> findByCommunityUuidOrderByIsPinnedDescCreatedAtDesc(UUID communityUuid);

    Optional<CommunityPost> findByPostUuid(UUID postUuid);
}
