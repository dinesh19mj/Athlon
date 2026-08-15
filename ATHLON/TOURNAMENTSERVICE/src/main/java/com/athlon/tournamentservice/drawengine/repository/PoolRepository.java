package com.athlon.tournamentservice.drawengine.repository;

import com.athlon.tournamentservice.drawengine.entity.Pool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PoolRepository extends JpaRepository<Pool, Long> {
    List<Pool> findByDrawId(Long drawId);
    void deleteByDrawId(Long drawId);
}
