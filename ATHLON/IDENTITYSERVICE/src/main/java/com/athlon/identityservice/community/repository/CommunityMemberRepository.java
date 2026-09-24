package com.athlon.identityservice.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.community.entity.CommunityMember;
import com.athlon.identityservice.community.enums.CommunityMemberStatus;
import com.athlon.identityservice.community.enums.CommunityRole;

@Repository
public interface CommunityMemberRepository extends JpaRepository<CommunityMember, Long> {

    List<CommunityMember> findByCommunityUuidAndStatus(UUID communityUuid, CommunityMemberStatus status);

    List<CommunityMember> findByCommunityUuid(UUID communityUuid);

    List<CommunityMember> findByUserUuidAndStatus(UUID userUuid, CommunityMemberStatus status);

    Optional<CommunityMember> findByCommunityUuidAndUserUuid(UUID communityUuid, UUID userUuid);

    long countByUserUuidAndStatus(UUID userUuid, CommunityMemberStatus status);

    long countByCommunityUuidAndStatus(UUID communityUuid, CommunityMemberStatus status);

    boolean existsByCommunityUuidAndUserUuidAndStatus(UUID communityUuid, UUID userUuid, CommunityMemberStatus status);

    boolean existsByCommunityUuidAndUserUuidAndRole(UUID communityUuid, UUID userUuid, CommunityRole role);
}
