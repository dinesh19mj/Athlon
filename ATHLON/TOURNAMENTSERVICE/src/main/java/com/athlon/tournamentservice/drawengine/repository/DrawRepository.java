package com.athlon.tournamentservice.drawengine.repository;

import com.athlon.tournamentservice.drawengine.entity.Draw;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DrawRepository extends JpaRepository<Draw, Long> {
    Optional<Draw> findByDrawUuid(UUID drawUuid);
    List<Draw> findByCategoryId(Long categoryId);
    List<Draw> findByTournamentId(Long tournamentId);
    void deleteByCategoryId(Long categoryId);
    void deleteByTournamentId(Long tournamentId);
}
