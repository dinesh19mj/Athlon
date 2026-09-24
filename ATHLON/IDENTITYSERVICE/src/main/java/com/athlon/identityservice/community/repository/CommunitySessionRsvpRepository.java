package com.athlon.identityservice.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.community.entity.CommunitySessionRsvp;
import com.athlon.identityservice.community.enums.SessionRsvpStatus;

@Repository
public interface CommunitySessionRsvpRepository extends JpaRepository<CommunitySessionRsvp, Long> {

    List<CommunitySessionRsvp> findBySessionUuid(UUID sessionUuid);

    List<CommunitySessionRsvp> findBySessionUuidAndRsvpStatus(UUID sessionUuid, SessionRsvpStatus rsvpStatus);

    Optional<CommunitySessionRsvp> findBySessionUuidAndUserUuid(UUID sessionUuid, UUID userUuid);

    long countBySessionUuidAndRsvpStatus(UUID sessionUuid, SessionRsvpStatus rsvpStatus);

    void deleteBySessionUuid(UUID sessionUuid);
}
