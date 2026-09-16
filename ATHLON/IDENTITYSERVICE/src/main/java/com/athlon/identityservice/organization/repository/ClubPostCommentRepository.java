package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.ClubPostComment;

@Repository
public interface ClubPostCommentRepository extends JpaRepository<ClubPostComment, Long> {

    Optional<ClubPostComment> findByCommentUuid(UUID commentUuid);

    List<ClubPostComment> findByPostUuidOrderByCreatedAtAsc(UUID postUuid);

    long countByPostUuid(UUID postUuid);
}
