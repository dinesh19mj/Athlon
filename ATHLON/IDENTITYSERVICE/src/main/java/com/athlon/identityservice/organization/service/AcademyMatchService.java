package com.athlon.identityservice.organization.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.dto.request.CreateAcademyMatchRequest;
import com.athlon.identityservice.organization.dto.request.UpdateAcademyMatchScoreRequest;
import com.athlon.identityservice.organization.dto.response.AcademyMatchResponse;
import com.athlon.identityservice.organization.entity.AcademyBatch;
import com.athlon.identityservice.organization.entity.AcademyCourt;
import com.athlon.identityservice.organization.entity.AcademyMatch;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.AcademyBatchRepository;
import com.athlon.identityservice.organization.repository.AcademyCourtRepository;
import com.athlon.identityservice.organization.repository.AcademyMatchRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;

@Service
public class AcademyMatchService {

    private final AcademyMatchRepository matchRepository;
    private final OrganizationRepository organizationRepository;
    private final AcademyBatchRepository batchRepository;
    private final AcademyCourtRepository courtRepository;

    public AcademyMatchService(AcademyMatchRepository matchRepository,
                               OrganizationRepository organizationRepository,
                               AcademyBatchRepository batchRepository,
                               AcademyCourtRepository courtRepository) {
        this.matchRepository = matchRepository;
        this.organizationRepository = organizationRepository;
        this.batchRepository = batchRepository;
        this.courtRepository = courtRepository;
    }

    public List<AcademyMatchResponse> getMatches(UUID organizationUuid, String status, String sportType, UUID batchUuid) {
        List<AcademyMatch> list;

        if (batchUuid != null) {
            list = matchRepository.findByOrganizationUuidAndBatchUuidOrderByMatchDateDesc(organizationUuid, batchUuid);
        } else if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            list = matchRepository.findByOrganizationUuidAndStatusOrderByMatchDateDesc(organizationUuid, status.toUpperCase());
        } else if (sportType != null && !sportType.trim().isEmpty() && !sportType.equalsIgnoreCase("ALL")) {
            list = matchRepository.findByOrganizationUuidAndSportTypeOrderByMatchDateDesc(organizationUuid, sportType);
        } else {
            list = matchRepository.findByOrganizationUuidOrderByMatchDateDesc(organizationUuid);
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public AcademyMatchResponse getMatchByUuid(UUID matchUuid) {
        AcademyMatch match = matchRepository.findByMatchUuid(matchUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with UUID: " + matchUuid));
        return mapToResponse(match);
    }

    @Transactional
    public AcademyMatchResponse createMatch(CreateAcademyMatchRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + request.getOrganizationUuid()));

        AcademyMatch match = new AcademyMatch();
        match.setOrganizationId(organization.getOrganizationId());
        match.setOrganizationUuid(organization.getOrganizationUuid());
        match.setMatchTitle(request.getMatchTitle());
        match.setSportType(request.getSportType());
        match.setMatchType(request.getMatchType() != null ? request.getMatchType() : "SINGLES");
        match.setBatchUuid(request.getBatchUuid());
        match.setBatchName(request.getBatchName());
        match.setCourtUuid(request.getCourtUuid());
        match.setCourtName(request.getCourtName());
        match.setCoachUuid(request.getCoachUuid());
        match.setCoachName(request.getCoachName());
        match.setMatchDate(request.getMatchDate() != null ? request.getMatchDate() : LocalDate.now());
        match.setMatchTime(request.getMatchTime());
        match.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "SCHEDULED");

        // Team 1
        match.setPlayer1Uuid(request.getPlayer1Uuid());
        match.setPlayer1Name(request.getPlayer1Name());
        match.setPlayer2Uuid(request.getPlayer2Uuid());
        match.setPlayer2Name(request.getPlayer2Name());
        match.setTeam1Score(request.getTeam1Score() != null ? request.getTeam1Score() : 0);

        // Team 2
        match.setPlayer3Uuid(request.getPlayer3Uuid());
        match.setPlayer3Name(request.getPlayer3Name());
        match.setPlayer4Uuid(request.getPlayer4Uuid());
        match.setPlayer4Name(request.getPlayer4Name());
        match.setTeam2Score(request.getTeam2Score() != null ? request.getTeam2Score() : 0);

        if (request.getScoresDetail() != null) {
            match.setScoresDetail(request.getScoresDetail());
        }
        if (request.getWinnerTeam() != null) {
            match.setWinnerTeam(request.getWinnerTeam());
            if (request.getWinnerName() != null && !request.getWinnerName().isEmpty()) {
                match.setWinnerName(request.getWinnerName());
            } else if (request.getWinnerTeam() == 1) {
                match.setWinnerName(match.getPlayer2Name() != null && !match.getPlayer2Name().isEmpty() 
                    ? match.getPlayer1Name() + " & " + match.getPlayer2Name() : match.getPlayer1Name());
            } else if (request.getWinnerTeam() == 2) {
                match.setWinnerName(match.getPlayer4Name() != null && !match.getPlayer4Name().isEmpty() 
                    ? match.getPlayer3Name() + " & " + match.getPlayer4Name() : match.getPlayer3Name());
            }
        }

        if (request.getStatus() != null) {
            match.setStatus(request.getStatus().toUpperCase());
        } else if (request.getWinnerTeam() != null || (request.getTeam1Score() != null && request.getTeam2Score() != null && (request.getTeam1Score() > 0 || request.getTeam2Score() > 0))) {
            match.setStatus("COMPLETED");
        } else {
            match.setStatus("COMPLETED");
        }

        match.setNotes(request.getNotes());
        match.setCreatedBy(currentUserId);

        // Auto-resolve batch or court name if UUID provided
        if (match.getBatchUuid() != null && (match.getBatchName() == null || match.getBatchName().isEmpty())) {
            Optional<AcademyBatch> bOpt = batchRepository.findByBatchUuid(match.getBatchUuid());
            if (bOpt.isPresent()) {
                match.setBatchName(bOpt.get().getBatchName());
            }
        }
        if (match.getCourtUuid() != null && (match.getCourtName() == null || match.getCourtName().isEmpty())) {
            Optional<AcademyCourt> cOpt = courtRepository.findByCourtUuid(match.getCourtUuid());
            if (cOpt.isPresent()) {
                match.setCourtName(cOpt.get().getName());
            }
        }

        AcademyMatch saved = matchRepository.save(match);
        return mapToResponse(saved);
    }

    @Transactional
    public AcademyMatchResponse updateScore(UUID matchUuid, UpdateAcademyMatchScoreRequest request, Long currentUserId) {
        AcademyMatch match = matchRepository.findByMatchUuid(matchUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with UUID: " + matchUuid));

        if (request.getTeam1Score() != null) match.setTeam1Score(request.getTeam1Score());
        if (request.getTeam2Score() != null) match.setTeam2Score(request.getTeam2Score());
        if (request.getScoresDetail() != null) match.setScoresDetail(request.getScoresDetail());
        if (request.getWinnerTeam() != null) {
            match.setWinnerTeam(request.getWinnerTeam());
            if (request.getWinnerTeam() == 1) {
                match.setWinnerName(match.getPlayer2Name() != null ? match.getPlayer1Name() + " / " + match.getPlayer2Name() : match.getPlayer1Name());
            } else if (request.getWinnerTeam() == 2) {
                match.setWinnerName(match.getPlayer4Name() != null ? match.getPlayer3Name() + " / " + match.getPlayer4Name() : match.getPlayer3Name());
            }
        }
        if (request.getWinnerName() != null) match.setWinnerName(request.getWinnerName());
        if (request.getStatus() != null) match.setStatus(request.getStatus().toUpperCase());
        if (request.getNotes() != null) match.setNotes(request.getNotes());
        match.setUpdatedBy(currentUserId);

        match = matchRepository.save(match);
        return mapToResponse(match);
    }

    @Transactional
    public void deleteMatch(UUID matchUuid) {
        AcademyMatch match = matchRepository.findByMatchUuid(matchUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with UUID: " + matchUuid));
        matchRepository.delete(match);
    }

    private AcademyMatchResponse mapToResponse(AcademyMatch match) {
        AcademyMatchResponse resp = new AcademyMatchResponse();
        resp.setMatchUuid(match.getMatchUuid());
        resp.setMatchId(match.getMatchId());
        resp.setOrganizationUuid(match.getOrganizationUuid());
        resp.setOrganizationId(match.getOrganizationId());
        resp.setMatchTitle(match.getMatchTitle());
        resp.setSportType(match.getSportType());
        resp.setMatchType(match.getMatchType());
        resp.setBatchUuid(match.getBatchUuid());
        resp.setBatchName(match.getBatchName());
        resp.setCourtUuid(match.getCourtUuid());
        resp.setCourtName(match.getCourtName());
        resp.setCoachUuid(match.getCoachUuid());
        resp.setCoachName(match.getCoachName());
        resp.setMatchDate(match.getMatchDate());
        resp.setMatchTime(match.getMatchTime());
        resp.setStatus(match.getStatus());
        resp.setPlayer1Uuid(match.getPlayer1Uuid());
        resp.setPlayer1Name(match.getPlayer1Name());
        resp.setPlayer2Uuid(match.getPlayer2Uuid());
        resp.setPlayer2Name(match.getPlayer2Name());
        resp.setTeam1Score(match.getTeam1Score());
        resp.setPlayer3Uuid(match.getPlayer3Uuid());
        resp.setPlayer3Name(match.getPlayer3Name());
        resp.setPlayer4Uuid(match.getPlayer4Uuid());
        resp.setPlayer4Name(match.getPlayer4Name());
        resp.setTeam2Score(match.getTeam2Score());
        resp.setWinnerTeam(match.getWinnerTeam());
        resp.setWinnerName(match.getWinnerName());
        resp.setScoresDetail(match.getScoresDetail());
        resp.setRefereeName(match.getRefereeName());
        resp.setNotes(match.getNotes());
        resp.setCreatedAt(match.getCreatedAt());
        resp.setUpdatedAt(match.getUpdatedAt());
        return resp;
    }
}
