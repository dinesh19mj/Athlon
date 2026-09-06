package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.AcademyPostComment;

@Repository
public interface AcademyPostCommentRepository extends JpaRepository<AcademyPostComment, Long> {

    Optional<AcademyPostComment> findByCommentUuid(UUID commentUuid);

    List<AcademyPostComment> findByPostUuidOrderByCreatedAtAsc(UUID postUuid);

    long countByPostUuid(UUID postUuid);
}
