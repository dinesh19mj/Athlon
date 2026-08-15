package com.athlon.tournamentservice.registration.repository;

import com.athlon.tournamentservice.registration.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

	Optional<Registration> findByRegistrationUuid(UUID registrationUuid);

	List<Registration> findByTournamentId(Long tournamentId);

	List<Registration> findByTournamentIdAndStatus(Long tournamentId, String status);

	List<Registration> findByPaymentStatus(String paymentStatus);

	List<Registration> findByTournamentIdAndPaymentStatus(Long tournamentId, String paymentStatus);

	List<Registration> findByTournamentIdAndStatusAndPaymentStatus(Long tournamentId, String status,
			String paymentStatus);

	List<Registration> findByCategoryIdAndStatus(Long categoryId, String status);

	List<Registration> findByCreatedBy(Long createdBy);
}
