package com.athlon.tournament.administration.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.athlon.tournament.administration.entity.JoinRequest;

import java.util.List;

@Repository
public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {
    List<JoinRequest> findByOrgId(Long orgId);
    List<JoinRequest> findByPlayerId(Long playerId);
    JoinRequest findByOrgIdAndPlayerId(Long orgId, Long playerId);
}
