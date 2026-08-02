package com.athlon.identityservice.player.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.athlon.identityservice.player.model.Players;

import java.util.Optional;

public interface PlayersRepository extends JpaRepository<Players, Long>{
	
    Optional<Players> findByEmail(String email);
    
    Optional<Players> findByPhoneNumber(String phoneNumber);
}
