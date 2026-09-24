package com.athlon.identityservice.community.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.community.entity.CommunityPostComment;

@Repository
public interface CommunityPostCommentRepository extends JpaRepository<CommunityPostComment, Long> {

    List<CommunityPostComment> findByPostIdOrderByCreatedAtAsc(Long postId);
}
