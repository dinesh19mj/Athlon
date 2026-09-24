package com.athlon.identityservice.community.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.community.entity.CommunityPollOption;

@Repository
public interface CommunityPollOptionRepository extends JpaRepository<CommunityPollOption, Long> {

    List<CommunityPollOption> findByPollId(Long pollId);
}
