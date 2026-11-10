package com.athlon.identityservice.subscription.repository;

import com.athlon.identityservice.subscription.entity.AuctionCreditActivation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuctionCreditActivationRepository extends JpaRepository<AuctionCreditActivation, Long> {

    Optional<AuctionCreditActivation> findByTournamentUuid(String tournamentUuid);
}

