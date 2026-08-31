package com.athlon.identityservice.organization.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.dto.request.CreateSportConfigRequest;
import com.athlon.identityservice.organization.dto.response.AcademySportConfigResponse;
import com.athlon.identityservice.organization.entity.AcademySportConfig;
import com.athlon.identityservice.organization.repository.AcademySportConfigRepository;

@Service
public class AcademySportConfigService {

    private final AcademySportConfigRepository sportConfigRepository;

    public AcademySportConfigService(AcademySportConfigRepository sportConfigRepository) {
        this.sportConfigRepository = sportConfigRepository;
    }

    @Transactional(readOnly = true)
    public List<AcademySportConfigResponse> getSports(UUID organizationUuid, String status) {
        List<AcademySportConfig> list;
        if (status != null && !status.isBlank()) {
            list = sportConfigRepository.findByOrganizationUuidAndStatusOrderBySportNameAsc(organizationUuid, status);
        } else {
            list = sportConfigRepository.findByOrganizationUuidOrderBySportNameAsc(organizationUuid);
        }

        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AcademySportConfigResponse createOrUpdateSport(CreateSportConfigRequest request) {
        AcademySportConfig sport = sportConfigRepository
                .findByOrganizationUuidAndSportNameIgnoreCase(request.getOrganizationUuid(), request.getSportName())
                .orElse(new AcademySportConfig());

        sport.setOrganizationUuid(request.getOrganizationUuid());
        sport.setSportName(request.getSportName());
        sport.setCode(request.getCode() != null ? request.getCode() : request.getSportName().toUpperCase().replaceAll("\\s+", "_"));
        sport.setDescription(request.getDescription());
        sport.setIcon(request.getIcon());
        sport.setApplicableFacilityTypes(request.getApplicableFacilityTypes());
        sport.setAgeCategories(request.getAgeCategories());
        sport.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        sport = sportConfigRepository.save(sport);
        return mapToResponse(sport);
    }

    @Transactional
    public void deleteSport(UUID sportUuid) {
        AcademySportConfig sport = sportConfigRepository.findBySportUuid(sportUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Academy sport config not found with UUID: " + sportUuid));
        sportConfigRepository.delete(sport);
    }

    private AcademySportConfigResponse mapToResponse(AcademySportConfig sport) {
        AcademySportConfigResponse res = new AcademySportConfigResponse();
        res.setSportId(sport.getSportId());
        res.setSportUuid(sport.getSportUuid());
        res.setOrganizationUuid(sport.getOrganizationUuid());
        res.setSportName(sport.getSportName());
        res.setCode(sport.getCode());
        res.setDescription(sport.getDescription());
        res.setIcon(sport.getIcon());
        res.setApplicableFacilityTypes(sport.getApplicableFacilityTypes());
        res.setAgeCategories(sport.getAgeCategories());
        res.setStatus(sport.getStatus());
        res.setCreatedAt(sport.getCreatedAt());
        res.setUpdatedAt(sport.getUpdatedAt());
        return res;
    }
}
