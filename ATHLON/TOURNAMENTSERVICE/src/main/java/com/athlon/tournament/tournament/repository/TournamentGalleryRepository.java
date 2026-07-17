package com.athlon.tournament.tournament.repository;

import com.athlon.tournament.tournament.entity.TournamentGallery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TournamentGalleryRepository extends JpaRepository<TournamentGallery, Long> {
    Optional<TournamentGallery> findByUuid(UUID uuid);
    List<TournamentGallery> findByTournamentIdAndIsActiveTrue(Long tournamentId);
}
