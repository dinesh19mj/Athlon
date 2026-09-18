package com.athlon.identityservice.rewards.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.rewards.entity.UserReferral;

@Repository
public interface UserReferralRepository extends JpaRepository<UserReferral, Long> {

    List<UserReferral> findByReferrerUserId(Long referrerUserId);

    Page<UserReferral> findByReferrerUserId(Long referrerUserId, Pageable pageable);

    Optional<UserReferral> findByRefereeUserId(Long refereeUserId);

    Optional<UserReferral> findByRefereeUserUuid(UUID refereeUserUuid);

    boolean existsByRefereeUserId(Long refereeUserId);

    long countByReferrerUserId(Long referrerUserId);
}
