package com.athlon.tournament.tournament.repository;

import com.athlon.tournament.tournament.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByUuid(UUID uuid);
    List<Category> findByTournamentIdAndIsActiveTrue(Long tournamentId);
}
