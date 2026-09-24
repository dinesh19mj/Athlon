package com.athlon.identityservice.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.community.entity.CommunityTeam;

@Repository
public interface CommunityTeamRepository extends JpaRepository<CommunityTeam, Long> {

    List<CommunityTeam> findByCommunityUuidAndStatusOrderByCreatedAtDesc(UUID communityUuid, String status);

    List<CommunityTeam> findByCommunityUuidOrderByCreatedAtDesc(UUID communityUuid);

    Optional<CommunityTeam> findByTeamUuid(UUID teamUuid);
}
