package com.athlon.identityservice.organization.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.dto.request.CreateFacilityRequest;
import com.athlon.identityservice.organization.dto.request.UpdateFacilityRequest;
import com.athlon.identityservice.organization.dto.response.AcademyFacilityResponse;
import com.athlon.identityservice.organization.entity.AcademyCentre;
import com.athlon.identityservice.organization.entity.AcademyFacility;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.AcademyCentreRepository;
import com.athlon.identityservice.organization.repository.AcademyFacilityRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;

@Service
public class AcademyFacilityService {

    private final AcademyFacilityRepository facilityRepository;
    private final AcademyCentreRepository centreRepository;
    private final OrganizationRepository organizationRepository;

    public AcademyFacilityService(
            AcademyFacilityRepository facilityRepository,
            AcademyCentreRepository centreRepository,
            OrganizationRepository organizationRepository) {
        this.facilityRepository = facilityRepository;
        this.centreRepository = centreRepository;
        this.organizationRepository = organizationRepository;
    }

    @Transactional(readOnly = true)
    public List<AcademyFacilityResponse> getFacilities(UUID organizationUuid, UUID centreUuid, String sportType, String status) {
        List<AcademyFacility> facilities;
        if (centreUuid != null) {
            facilities = facilityRepository.findByOrganizationUuidAndCentreUuidOrderByCreatedAtDesc(organizationUuid, centreUuid);
        } else if (sportType != null && !sportType.isBlank()) {
            facilities = facilityRepository.findByOrganizationUuidAndSportTypeOrderByCreatedAtDesc(organizationUuid, sportType);
        } else if (status != null && !status.isBlank()) {
            facilities = facilityRepository.findByOrganizationUuidAndStatusOrderByCreatedAtDesc(organizationUuid, status);
        } else {
            facilities = facilityRepository.findByOrganizationUuidOrderByCreatedAtDesc(organizationUuid);
        }

        return facilities.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AcademyFacilityResponse getFacilityByUuid(UUID facilityUuid) {
        AcademyFacility facility = facilityRepository.findByFacilityUuid(facilityUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Academy facility not found with UUID: " + facilityUuid));
        return mapToResponse(facility);
    }

    @Transactional
    public AcademyFacilityResponse createFacility(CreateFacilityRequest request) {
        Organization org = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + request.getOrganizationUuid()));

        AcademyFacility facility = new AcademyFacility();
        facility.setOrganizationId(org.getOrganizationId());
        facility.setOrganizationUuid(org.getOrganizationUuid());
        facility.setCentreUuid(request.getCentreUuid());

        // Resolve centre name if centreUuid is provided
        if (request.getCentreUuid() != null) {
            centreRepository.findByCentreUuid(request.getCentreUuid())
                    .ifPresent(centre -> {
                        String name = centre.getName();
                        facility.setCentreName(name);
                    });
        }
        if (request.getCentreName() != null && facility.getCentreName() == null) {
            facility.setCentreName(request.getCentreName());
        }

        facility.setName(request.getName());
        facility.setSportType(request.getSportType() != null ? request.getSportType() : "BADMINTON");
        facility.setFacilityType(request.getFacilityType() != null ? request.getFacilityType() : "BADMINTON_COURT");
        facility.setSurfaceType(request.getSurfaceType() != null ? request.getSurfaceType() : "Synthetic BWF Mat");
        facility.setFacilityNumber(request.getFacilityNumber());
        facility.setLocationDetails(request.getLocationDetails());
        facility.setCapacity(request.getCapacity() != null ? request.getCapacity() : 8);
        facility.setHourlyRate(request.getHourlyRate());
        facility.setOperatingHours(request.getOperatingHours());
        facility.setIsAvailableForBooking(request.getIsAvailableForBooking() != null ? request.getIsAvailableForBooking() : true);
        facility.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        AcademyFacility savedFacility = facilityRepository.save(facility);
        return mapToResponse(savedFacility);
    }

    @Transactional
    public AcademyFacilityResponse updateFacility(UUID facilityUuid, UpdateFacilityRequest request) {
        AcademyFacility facility = facilityRepository.findByFacilityUuid(facilityUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Academy facility not found with UUID: " + facilityUuid));

        if (request.getCentreUuid() != null) {
            facility.setCentreUuid(request.getCentreUuid());
            centreRepository.findByCentreUuid(request.getCentreUuid())
                    .ifPresent(centre -> {
                        String name = centre.getName();
                        facility.setCentreName(name);
                    });
        }
        if (request.getCentreName() != null) facility.setCentreName(request.getCentreName());
        if (request.getName() != null) facility.setName(request.getName());
        if (request.getSportType() != null) facility.setSportType(request.getSportType());
        if (request.getFacilityType() != null) facility.setFacilityType(request.getFacilityType());
        if (request.getSurfaceType() != null) facility.setSurfaceType(request.getSurfaceType());
        if (request.getFacilityNumber() != null) facility.setFacilityNumber(request.getFacilityNumber());
        if (request.getLocationDetails() != null) facility.setLocationDetails(request.getLocationDetails());
        if (request.getCapacity() != null) facility.setCapacity(request.getCapacity());
        if (request.getHourlyRate() != null) facility.setHourlyRate(request.getHourlyRate());
        if (request.getOperatingHours() != null) facility.setOperatingHours(request.getOperatingHours());
        if (request.getIsAvailableForBooking() != null) facility.setIsAvailableForBooking(request.getIsAvailableForBooking());
        if (request.getStatus() != null) facility.setStatus(request.getStatus());

        AcademyFacility updatedFacility = facilityRepository.save(facility);
        return mapToResponse(updatedFacility);
    }

    @Transactional
    public void deleteFacility(UUID facilityUuid) {
        AcademyFacility facility = facilityRepository.findByFacilityUuid(facilityUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Academy facility not found with UUID: " + facilityUuid));
        facilityRepository.delete(facility);
    }

    private AcademyFacilityResponse mapToResponse(AcademyFacility facility) {
        AcademyFacilityResponse res = new AcademyFacilityResponse();
        res.setFacilityId(facility.getFacilityId());
        res.setFacilityUuid(facility.getFacilityUuid());
        res.setOrganizationId(facility.getOrganizationId());
        res.setOrganizationUuid(facility.getOrganizationUuid());
        res.setCentreUuid(facility.getCentreUuid());
        res.setCentreName(facility.getCentreName());
        res.setName(facility.getName());
        res.setSportType(facility.getSportType());
        res.setFacilityType(facility.getFacilityType());
        res.setSurfaceType(facility.getSurfaceType());
        res.setFacilityNumber(facility.getFacilityNumber());
        res.setLocationDetails(facility.getLocationDetails());
        res.setCapacity(facility.getCapacity());
        res.setHourlyRate(facility.getHourlyRate());
        res.setOperatingHours(facility.getOperatingHours());
        res.setIsAvailableForBooking(facility.getIsAvailableForBooking());
        res.setStatus(facility.getStatus());
        res.setCreatedAt(facility.getCreatedAt());
        res.setUpdatedAt(facility.getUpdatedAt());
        return res;
    }
}
