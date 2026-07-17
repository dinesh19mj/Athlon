package com.athlon.tournament.registration.service;

import com.athlon.tournament.dto.request.RegistrationCreateRequest;
import com.athlon.tournament.dto.response.RegistrationResponse;
import com.athlon.tournament.exception.ResourceNotFoundException;
import com.athlon.tournament.registration.entity.Registration;
import com.athlon.tournament.registration.repository.RegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;

    public RegistrationService(RegistrationRepository registrationRepository) {
        this.registrationRepository = registrationRepository;
    }

    @Transactional
    public RegistrationResponse createRegistration(RegistrationCreateRequest request) {
        Registration registration = new Registration(
                request.getTournamentId(),
                request.getTournamentUuid(),
                request.getCategoryId(),
                request.getCategoryUuid(),
                request.getTeamName(),
                request.getPrimaryContactId(),
                request.getPrimaryContactUuid(),
                request.getCreatedBy()
        );

        Registration saved = registrationRepository.save(registration);
        return RegistrationResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getRegistrationsByCategory(Long categoryId) {
        return registrationRepository.findByCategoryIdAndIsActiveTrue(categoryId).stream()
                .map(RegistrationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RegistrationResponse getRegistrationByUuid(UUID uuid) {
        Registration registration = registrationRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found with UUID: " + uuid));
        return RegistrationResponse.fromEntity(registration);
    }
}
