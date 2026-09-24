package com.athlon.marketplaceservice.repository;

import com.athlon.marketplaceservice.entity.MarketplaceSellerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MarketplaceSellerProfileRepository extends JpaRepository<MarketplaceSellerProfile, Long> {

    Optional<MarketplaceSellerProfile> findByUserId(String userId);

    @Query(value = "SELECT COUNT(DISTINCT rp.tournamentid) " +
                   "FROM registration_players rp " +
                   "JOIN tournament_registrations r ON rp.registrationid = r.registrationid " +
                   "WHERE (CAST(rp.playerid AS text) = :userId OR CAST(r.primarycontactid AS text) = :userId) " +
                   "  AND UPPER(r.status) IN ('CONFIRMED', 'APPROVED', 'COMPLETED')", 
           nativeQuery = true)
    Long countVerifiedTournamentsForUser(@Param("userId") String userId);
}
