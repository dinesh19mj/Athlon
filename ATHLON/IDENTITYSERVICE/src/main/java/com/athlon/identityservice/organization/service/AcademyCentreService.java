package com.athlon.identityservice.organization.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.dto.request.CreateCentreRequest;
import com.athlon.identityservice.organization.dto.request.UpdateCentreRequest;
import com.athlon.identityservice.organization.dto.response.AcademyCentreResponse;
import com.athlon.identityservice.organization.entity.AcademyCentre;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.AcademyCentreRepository;
import com.athlon.identityservice.organization.repository.AcademyFacilityRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;

@Service
public class AcademyCentreService {

    private final AcademyCentreRepository centreRepository;
    private final AcademyFacilityRepository facilityRepository;
    private final OrganizationRepository organizationRepository;

    public AcademyCentreService(
            AcademyCentreRepository centreRepository,
            AcademyFacilityRepository facilityRepository,
            OrganizationRepository organizationRepository) {
        this.centreRepository = centreRepository;
        this.facilityRepository = facilityRepository;
        this.organizationRepository = organizationRepository;
    }

    @Transactional(readOnly = true)
    public List<AcademyCentreResponse> getCentres(UUID organizationUuid, String status) {
        List<AcademyCentre> centres;
        if (status != null && !status.isBlank()) {
            centres = centreRepository.findByOrganizationUuidAndStatusOrderByCreatedAtDesc(organizationUuid, status);
        } else {
            centres = centreRepository.findByOrganizationUuidOrderByCreatedAtDesc(organizationUuid);
        }

        return centres.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AcademyCentreResponse getCentreByUuid(UUID centreUuid) {
        AcademyCentre centre = centreRepository.findByCentreUuid(centreUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Academy centre not found with UUID: " + centreUuid));
        return mapToResponse(centre);
    }

    @Transactional
    public AcademyCentreResponse createCentre(CreateCentreRequest request) {
        Organization org = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + request.getOrganizationUuid()));

        AcademyCentre centre = new AcademyCentre();
        centre.setOrganizationId(org.getOrganizationId());
        centre.setOrganizationUuid(org.getOrganizationUuid());
        centre.setName(request.getName());
        centre.setCode(request.getCode());
        centre.setAddress(request.getAddress());
        centre.setCity(request.getCity());
        centre.setState(request.getState());
        centre.setPostalCode(request.getPostalCode());
        centre.setCountry(request.getCountry());
        centre.setContactPhone(request.getContactPhone());
        centre.setContactEmail(request.getContactEmail());
        centre.setMapLocationUrl(request.getMapLocationUrl());
        centre.setOperatingHours(request.getOperatingHours());
        centre.setSportsAvailable(request.getSportsAvailable());
        centre.setManagerName(request.getManagerName());
        centre.setManagerPhone(request.getManagerPhone());
        centre.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        centre = centreRepository.save(centre);
        return mapToResponse(centre);
    }

    @Transactional
    public AcademyCentreResponse updateCentre(UUID centreUuid, UpdateCentreRequest request) {
        AcademyCentre centre = centreRepository.findByCentreUuid(centreUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Academy centre not found with UUID: " + centreUuid));

        if (request.getName() != null) centre.setName(request.getName());
        if (request.getCode() != null) centre.setCode(request.getCode());
        if (request.getAddress() != null) centre.setAddress(request.getAddress());
        if (request.getCity() != null) centre.setCity(request.getCity());
        if (request.getState() != null) centre.setState(request.getState());
        if (request.getPostalCode() != null) centre.setPostalCode(request.getPostalCode());
        if (request.getCountry() != null) centre.setCountry(request.getCountry());
        if (request.getContactPhone() != null) centre.setContactPhone(request.getContactPhone());
        if (request.getContactEmail() != null) centre.setContactEmail(request.getContactEmail());
        if (request.getMapLocationUrl() != null) centre.setMapLocationUrl(request.getMapLocationUrl());
        if (request.getOperatingHours() != null) centre.setOperatingHours(request.getOperatingHours());
        if (request.getSportsAvailable() != null) centre.setSportsAvailable(request.getSportsAvailable());
        if (request.getManagerName() != null) centre.setManagerName(request.getManagerName());
        if (request.getManagerPhone() != null) centre.setManagerPhone(request.getManagerPhone());
        if (request.getStatus() != null) centre.setStatus(request.getStatus());

        centre = centreRepository.save(centre);
        return mapToResponse(centre);
    }

    @Transactional
    public void deleteCentre(UUID centreUuid) {
        AcademyCentre centre = centreRepository.findByCentreUuid(centreUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Academy centre not found with UUID: " + centreUuid));
        centreRepository.delete(centre);
    }

    private AcademyCentreResponse mapToResponse(AcademyCentre centre) {
        AcademyCentreResponse res = new AcademyCentreResponse();
        res.setCentreId(centre.getCentreId());
        res.setCentreUuid(centre.getCentreUuid());
        res.setOrganizationId(centre.getOrganizationId());
        res.setOrganizationUuid(centre.getOrganizationUuid());
        res.setName(centre.getName());
        res.setCode(centre.getCode());
        res.setAddress(centre.getAddress());
        res.setCity(centre.getCity());
        res.setState(centre.getState());
        res.setPostalCode(centre.getPostalCode());
        res.setCountry(centre.getCountry());
        res.setContactPhone(centre.getContactPhone());
        res.setContactEmail(centre.getContactEmail());
        res.setMapLocationUrl(centre.getMapLocationUrl());
        res.setOperatingHours(centre.getOperatingHours());
        res.setSportsAvailable(centre.getSportsAvailable());
        res.setManagerName(centre.getManagerName());
        res.setManagerPhone(centre.getManagerPhone());
        res.setStatus(centre.getStatus());
        res.setCreatedAt(centre.getCreatedAt());
        res.setUpdatedAt(centre.getUpdatedAt());

        // Count associated facilities
        if (centre.getCentreUuid() != null) {
            int facilitiesCount = facilityRepository
                    .findByOrganizationUuidAndCentreUuidOrderByCreatedAtDesc(centre.getOrganizationUuid(), centre.getCentreUuid())
                    .size();
            res.setFacilitiesCount(facilitiesCount);
        }

        return res;
    }
}
