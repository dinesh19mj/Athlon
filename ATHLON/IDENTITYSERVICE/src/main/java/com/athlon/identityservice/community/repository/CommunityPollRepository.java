package com.athlon.identityservice.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.community.entity.CommunityPoll;

@Repository
public interface CommunityPollRepository extends JpaRepository<CommunityPoll, Long> {

    List<CommunityPoll> findByCommunityUuidOrderByCreatedAtDesc(UUID communityUuid);

    Optional<CommunityPoll> findByPollUuid(UUID pollUuid);
}
