package com.athlon.tournamentservice.tournament.repository;

import com.athlon.tournamentservice.tournament.entity.TournamentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TournamentCategoryRepository extends JpaRepository<TournamentCategory, Long> {
	
	Optional<TournamentCategory> findByCategoryUuid(UUID categoryUuid);

    List<TournamentCategory> findByOrganizationIdAndIsActive(Long organizationId, Integer isActive);

    boolean existsByOrganizationIdAndCategoryName(Long organizationId, String categoryName);
}

