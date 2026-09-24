package com.athlon.identityservice.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.community.entity.CommunityMatch;

@Repository
public interface CommunityMatchRepository extends JpaRepository<CommunityMatch, Long> {

    List<CommunityMatch> findByCommunityUuidOrderByMatchDateDescCreatedAtDesc(UUID communityUuid);

    Optional<CommunityMatch> findByMatchUuid(UUID matchUuid);

    long countByCommunityUuid(UUID communityUuid);
}
