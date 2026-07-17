package com.athlon.tournament.statistics.repository;

import com.athlon.tournament.statistics.entity.Statistic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StatisticRepository extends JpaRepository<Statistic, Long> {
    Optional<Statistic> findByUuid(UUID uuid);
    List<Statistic> findByCategoryIdAndIsActiveTrue(Long categoryId);
}
