package com.athlon.identityservice.community.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.community.entity.CommunitySession;
import com.athlon.identityservice.community.enums.SessionStatus;

@Repository
public interface CommunitySessionRepository extends JpaRepository<CommunitySession, Long> {

    List<CommunitySession> findByCommunityUuidOrderBySessionDateDescStartTimeDesc(UUID communityUuid);

    List<CommunitySession> findByCommunityUuidAndSessionDateGreaterThanEqualAndStatusOrderBySessionDateAscStartTimeAsc(
            UUID communityUuid, LocalDate sessionDate, SessionStatus status);

    Optional<CommunitySession> findBySessionUuid(UUID sessionUuid);

    List<CommunitySession> findBySessionDateGreaterThanEqualAndStatusOrderBySessionDateAscStartTimeAsc(
            LocalDate sessionDate, SessionStatus status);

    List<CommunitySession> findAllByOrderBySessionDateDescStartTimeDesc();

    long countByCommunityUuid(UUID communityUuid);
}
