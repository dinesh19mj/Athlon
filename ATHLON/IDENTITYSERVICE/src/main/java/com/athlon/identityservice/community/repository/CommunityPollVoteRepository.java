package com.athlon.identityservice.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.community.entity.CommunityPollVote;

@Repository
public interface CommunityPollVoteRepository extends JpaRepository<CommunityPollVote, Long> {

    List<CommunityPollVote> findByPollId(Long pollId);

    List<CommunityPollVote> findByPollIdAndUserUuid(Long pollId, UUID userUuid);

    Optional<CommunityPollVote> findByPollIdAndOptionIdAndUserUuid(Long pollId, Long optionId, UUID userUuid);

    boolean existsByPollIdAndUserUuid(Long pollId, UUID userUuid);
}
