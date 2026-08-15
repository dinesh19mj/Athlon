package com.athlon.tournamentservice.teamevent.repository;

import com.athlon.tournamentservice.teamevent.entity.TeamEventCategoryMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamEventCategoryMatchRepository extends JpaRepository<TeamEventCategoryMatch, Long> {
    Optional<TeamEventCategoryMatch> findByUuid(UUID uuid);
    List<TeamEventCategoryMatch> findByParentMatchId(Long parentMatchId);
    List<TeamEventCategoryMatch> findByParentMatchIdOrderByMatchOrderAsc(Long parentMatchId);
}
