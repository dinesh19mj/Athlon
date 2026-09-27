package com.athlon.tournamentservice.tournament.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.tournamentservice.tournament.entity.Sport;

@Repository
public interface SportRepository extends JpaRepository<Sport, Long> {

    Optional<Sport> findBySportUuid(UUID sportUuid);

    Optional<Sport> findBySportNameIgnoreCase(String sportName);

    Optional<Sport> findBySportCodeIgnoreCase(String sportCode);

    List<Sport> findByIsActiveOrderByDisplayOrderAsc(Integer isActive);

    boolean existsBySportNameIgnoreCase(String sportName);
}
