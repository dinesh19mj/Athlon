package com.athlon.identityservice.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.community.entity.CommunityTeamMember;

@Repository
public interface CommunityTeamMemberRepository extends JpaRepository<CommunityTeamMember, Long> {

    List<CommunityTeamMember> findByTeamId(Long teamId);

    List<CommunityTeamMember> findByTeamUuid(UUID teamUuid);

    Optional<CommunityTeamMember> findByTeamIdAndUserUuid(Long teamId, UUID userUuid);

    boolean existsByTeamIdAndUserUuid(Long teamId, UUID userUuid);

    long countByTeamId(Long teamId);
}
