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

    List<TournamentCategory> findByOrganizationUuidAndIsActive(UUID organizationUuid, Integer isActive);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM TournamentCategory c WHERE (c.organizationId IS NULL OR c.organizationId = 0) AND c.isActive = :isActive")
    List<TournamentCategory> findCommonCategories(@org.springframework.data.repository.query.Param("isActive") Integer isActive);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM TournamentCategory c WHERE (c.organizationId IS NULL OR c.organizationId = 0) AND (LOWER(c.sportType) = LOWER(:sportType) OR LOWER(c.sportType) = 'all') AND c.isActive = :isActive")
    List<TournamentCategory> findCommonCategoriesBySport(@org.springframework.data.repository.query.Param("sportType") String sportType, @org.springframework.data.repository.query.Param("isActive") Integer isActive);

    List<TournamentCategory> findBySportTypeIgnoreCaseAndIsActive(String sportType, Integer isActive);

    List<TournamentCategory> findByIsActive(Integer isActive);

    boolean existsByOrganizationIdAndCategoryName(Long organizationId, String categoryName);

    boolean existsByCategoryNameIgnoreCaseAndSportTypeIgnoreCase(String categoryName, String sportType);

    boolean existsByCategoryNameIgnoreCaseAndOrganizationIdIsNull(String categoryName);
}

