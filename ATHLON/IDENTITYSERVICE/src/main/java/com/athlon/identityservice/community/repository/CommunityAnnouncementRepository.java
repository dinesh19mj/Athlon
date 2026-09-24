package com.athlon.identityservice.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.community.entity.CommunityAnnouncement;

@Repository
public interface CommunityAnnouncementRepository extends JpaRepository<CommunityAnnouncement, Long> {

    List<CommunityAnnouncement> findByCommunityUuidOrderByIsPinnedDescCreatedAtDesc(UUID communityUuid);

    Optional<CommunityAnnouncement> findByAnnouncementUuid(UUID announcementUuid);
}
