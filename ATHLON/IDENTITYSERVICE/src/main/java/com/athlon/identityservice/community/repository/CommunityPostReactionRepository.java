package com.athlon.identityservice.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.community.entity.CommunityPostReaction;

@Repository
public interface CommunityPostReactionRepository extends JpaRepository<CommunityPostReaction, Long> {

    List<CommunityPostReaction> findByPostId(Long postId);

    Optional<CommunityPostReaction> findByPostIdAndUserUuid(Long postId, UUID userUuid);

    boolean existsByPostIdAndUserUuid(Long postId, UUID userUuid);
}
