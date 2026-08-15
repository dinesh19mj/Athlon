package com.athlon.tournamentservice.drawengine.repository;

import com.athlon.tournamentservice.drawengine.entity.PoolTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PoolTeamRepository extends JpaRepository<PoolTeam, Long> {
    List<PoolTeam> findByPoolId(Long poolId);
    void deleteByPoolId(Long poolId);
}
