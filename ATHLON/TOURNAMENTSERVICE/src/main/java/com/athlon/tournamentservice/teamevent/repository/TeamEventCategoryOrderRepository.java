package com.athlon.tournamentservice.teamevent.repository;

import com.athlon.tournamentservice.teamevent.entity.TeamEventCategoryOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamEventCategoryOrderRepository extends JpaRepository<TeamEventCategoryOrder, Long> {
    Optional<TeamEventCategoryOrder> findByUuid(UUID uuid);
    List<TeamEventCategoryOrder> findByFixtureMatchIdOrderByMatchOrderAsc(Long fixtureMatchId);
}
