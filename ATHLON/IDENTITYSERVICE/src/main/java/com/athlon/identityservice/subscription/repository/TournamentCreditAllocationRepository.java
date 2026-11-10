package com.athlon.identityservice.subscription.repository;

import com.athlon.identityservice.subscription.entity.TournamentCreditAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TournamentCreditAllocationRepository extends JpaRepository<TournamentCreditAllocation, Long> {

    Optional<TournamentCreditAllocation> findByTournamentUuid(String tournamentUuid);
}

