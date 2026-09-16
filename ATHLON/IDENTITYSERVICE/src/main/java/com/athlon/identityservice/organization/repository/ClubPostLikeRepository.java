package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.ClubPostLike;

@Repository
public interface ClubPostLikeRepository extends JpaRepository<ClubPostLike, Long> {

    Optional<ClubPostLike> findByPostUuidAndUserUuid(UUID postUuid, UUID userUuid);

    List<ClubPostLike> findByPostUuid(UUID postUuid);

    long countByPostUuid(UUID postUuid);

    void deleteByPostUuidAndUserUuid(UUID postUuid, UUID userUuid);
}
