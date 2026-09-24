package com.athlon.identityservice.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.community.entity.CommunityAttendance;

@Repository
public interface CommunityAttendanceRepository extends JpaRepository<CommunityAttendance, Long> {

    List<CommunityAttendance> findBySessionUuid(UUID sessionUuid);

    List<CommunityAttendance> findByCommunityUuidAndUserUuid(UUID communityUuid, UUID userUuid);

    Optional<CommunityAttendance> findBySessionUuidAndUserUuid(UUID sessionUuid, UUID userUuid);

    void deleteBySessionUuid(UUID sessionUuid);
}
