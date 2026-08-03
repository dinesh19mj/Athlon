package com.athlon.identityservice.user.repository;

import com.athlon.identityservice.user.entity.SportsProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SportsProfileRepository extends JpaRepository<SportsProfile, Long> {

	Optional<SportsProfile> findBySportsProfileUuid(UUID sportsProfileUuid);

    List<SportsProfile> findByUserId(Long userId);

    List<SportsProfile> findByUserUuid(UUID userUuid);

    Optional<SportsProfile> findByUserUuidAndSportName(UUID userUuid, String sportName);
}
