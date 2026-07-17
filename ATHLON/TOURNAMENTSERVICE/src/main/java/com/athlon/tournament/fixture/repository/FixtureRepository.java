package com.athlon.tournament.fixture.repository;

import com.athlon.tournament.fixture.entity.Fixture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FixtureRepository extends JpaRepository<Fixture, Long> {
    Optional<Fixture> findByUuid(UUID uuid);
    List<Fixture> findByCategoryIdAndIsActiveTrue(Long categoryId);
}
