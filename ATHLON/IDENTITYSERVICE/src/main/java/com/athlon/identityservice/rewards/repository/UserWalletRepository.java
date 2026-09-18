package com.athlon.identityservice.rewards.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.rewards.entity.UserWallet;

import jakarta.persistence.LockModeType;

@Repository
public interface UserWalletRepository extends JpaRepository<UserWallet, Long> {

    Optional<UserWallet> findByUserId(Long userId);

    Optional<UserWallet> findByUserUuid(UUID userUuid);

    Optional<UserWallet> findByReferralCode(String referralCode);

    boolean existsByReferralCode(String referralCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM UserWallet w WHERE w.userId = :userId")
    Optional<UserWallet> findByUserIdWithLock(@Param("userId") Long userId);
}
