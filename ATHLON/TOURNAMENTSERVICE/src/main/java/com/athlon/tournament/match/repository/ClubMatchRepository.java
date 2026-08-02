package com.athlon.tournament.match.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.athlon.tournament.match.entity.ClubMatch;

import java.util.List;

@Repository
public interface ClubMatchRepository extends JpaRepository<ClubMatch, Long> {
    List<ClubMatch> findByOrgId(Long orgId);
}
