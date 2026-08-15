package com.athlon.tournamentservice.teamevent.repository;

import com.athlon.tournamentservice.teamevent.entity.TeamEventCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamEventCategoryRepository extends JpaRepository<TeamEventCategory, Long> {
    Optional<TeamEventCategory> findByUuid(UUID uuid);
    List<TeamEventCategory> findByTournamentIdAndIsActive(Long tournamentId, Integer isActive);
}
