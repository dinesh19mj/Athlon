package com.athlon.tournamentservice.tournament.service;

import com.athlon.tournamentservice.dto.request.TournamentCreateRequest;
import com.athlon.tournamentservice.dto.response.TournamentResponse;
import com.athlon.tournamentservice.exception.ResourceNotFoundException;
import com.athlon.tournamentservice.tournament.entity.Tournament;
import com.athlon.tournamentservice.tournament.repository.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.athlon.tournamentservice.teamevent.entity.TeamEventCategory;
import com.athlon.tournamentservice.teamevent.repository.TeamEventCategoryRepository;

import org.springframework.web.multipart.MultipartFile;
import com.athlon.tournamentservice.util.FileStorageUtil;
import org.springframework.beans.factory.annotation.Value;

@Service
public class TournamentService {

	private final TournamentRepository tournamentRepository;
	private final FileStorageUtil fileStorageUtil;
    private final TeamEventCategoryRepository teamEventCategoryRepository;
    private final ObjectMapper objectMapper;

	@Value("${athlon.tournament.poster.upload.directory}")
	private String posterUploadDir;

	public TournamentService(TournamentRepository tournamentRepository, FileStorageUtil fileStorageUtil,
                             TeamEventCategoryRepository teamEventCategoryRepository, ObjectMapper objectMapper) {
		this.tournamentRepository = tournamentRepository;
		this.fileStorageUtil = fileStorageUtil;
        this.teamEventCategoryRepository = teamEventCategoryRepository;
        this.objectMapper = objectMapper;
	}

	@Transactional
	public TournamentResponse createTournament(TournamentCreateRequest request, MultipartFile poster)
			throws IOException {
		return createTournament(request, poster, null);
	}

	@Transactional
	public TournamentResponse createTournament(TournamentCreateRequest request, MultipartFile poster, MultipartFile upiQrCode)
			throws IOException {
		Tournament tournament = new Tournament(
				request.getName(), 
				request.getDescription(), 
				request.getStartDate(),
				request.getEndDate(), 
				request.getOrganizerId(), 
				request.getOrganizerUuid(), 
				request.getUserId(),
				request.getUserUuid(), 
				request.getTournamentType(),
				request.getSport(),
				request.getMatchFormat(),
				request.getVisibility() != null ? request.getVisibility() : "PRIVATE",
				request.getCategory(),
				request.getPlayersCount(),
				request.getLocation(),
				request.getMapLink(),
				request.getContactPhone(),
				request.getRegistrationFees(),
				null,
				"ACTIVE", 
				request.getCreatedBy()
		);

		tournament.setRegistrationClosingDate(request.getRegistrationClosingDate());
		tournament.setGpayNumber(request.getGpayNumber());

		if (poster != null && !poster.isEmpty()) {
			String fileName = fileStorageUtil.saveFileToDir(poster, System.getProperty("tournament"), posterUploadDir);
			tournament.setPoster("/" + posterUploadDir + "/" + fileName);
		}

		if (upiQrCode != null && !upiQrCode.isEmpty()) {
			String qrFileName = fileStorageUtil.saveFileToDir(upiQrCode, System.getProperty("tournament"), posterUploadDir);
			tournament.setUpiQrCode("/" + posterUploadDir + "/" + qrFileName);
		}

		Tournament saved = tournamentRepository.save(tournament);

        if ("TEAM_EVENT".equalsIgnoreCase(request.getTournamentType()) && request.getTeamEventCategories() != null) {
            try {
                List<Map<String, Object>> categories = objectMapper.readValue(request.getTeamEventCategories(), new TypeReference<List<Map<String, Object>>>() {});
                int displayOrder = 1;
                for (Map<String, Object> catMap : categories) {
                    TeamEventCategory cat = new TeamEventCategory();
                    cat.setTournamentId(saved.getTournamentId());
                    cat.setTournamentUuid(saved.getTournamentUuid());
                    cat.setName((String) catMap.get("name"));
                    cat.setMatchFormat((String) catMap.get("matchFormat"));
                    cat.setPlayersRequired((Integer) catMap.get("playersRequired"));
                    cat.setDisplayOrder(displayOrder++);
                    teamEventCategoryRepository.save(cat);
                }
            } catch (Exception e) {
                // Log and swallow or throw
                e.printStackTrace();
            }
        }

		TournamentResponse res = TournamentResponse.fromEntity(saved);
        populateTeamEventCategories(res, saved);
		return res;
	}

	@Transactional(readOnly = true)
	public TournamentResponse getTournamentByUuid(UUID uuid) {
		Tournament tournament = tournamentRepository.findByTournamentUuid(uuid)
				.orElseThrow(() -> new ResourceNotFoundException("Tournament not found with UUID: " + uuid));
		TournamentResponse res = TournamentResponse.fromEntity(tournament);
        populateTeamEventCategories(res, tournament);
        return res;
	}

	@Transactional(readOnly = true)
	public List<TournamentResponse> getAllActiveTournaments() {
		return tournamentRepository.findAll().stream()
				.filter(Tournament::isActive)
				.sorted(Comparator.comparing(Tournament::getTournamentId, Comparator.nullsLast(Comparator.reverseOrder())))
				.map(t -> {
					TournamentResponse res = TournamentResponse.fromEntity(t);
					populateTeamEventCategories(res, t);
					return res;
				}).collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<TournamentResponse> getTournamentsByOrganizationUuid(UUID orgUuid) {
		return tournamentRepository.findByOrganizerUuidAndIsActive(orgUuid, 1).stream()
				.sorted(Comparator.comparing(Tournament::getTournamentId, Comparator.nullsLast(Comparator.reverseOrder())))
				.map(t -> {
					TournamentResponse res = TournamentResponse.fromEntity(t);
					populateTeamEventCategories(res, t);
					return res;
				}).collect(Collectors.toList());
	}

	@Transactional
	public TournamentResponse updateStatus(UUID uuid, String status) {
		Tournament tournament = tournamentRepository.findByTournamentUuid(uuid)
				.orElseThrow(() -> new ResourceNotFoundException("Tournament not found with UUID: " + uuid));
		tournament.setStatus(status);
		Tournament saved = tournamentRepository.save(tournament);
		TournamentResponse res = TournamentResponse.fromEntity(saved);
		populateTeamEventCategories(res, saved);
		return res;
	}

	@Transactional
	public void deactivateTournament(UUID uuid) {
		Tournament tournament = tournamentRepository.findByTournamentUuid(uuid)
				.orElseThrow(() -> new ResourceNotFoundException("Tournament not found with UUID: " + uuid));
		tournament.setActive(false);
		tournamentRepository.save(tournament);
	}

    private void populateTeamEventCategories(TournamentResponse response, Tournament tournament) {
        if ("TEAM_EVENT".equalsIgnoreCase(tournament.getTournamentType())) {
            List<TeamEventCategory> categories = teamEventCategoryRepository.findByTournamentIdAndIsActive(tournament.getTournamentId(), 1);
            if (!categories.isEmpty()) {
                String matchFormats = categories.stream().map(TeamEventCategory::getMatchFormat).distinct().collect(Collectors.joining(","));
                String categoryNames = categories.stream().map(TeamEventCategory::getName).distinct().collect(Collectors.joining(","));
                response.setMatchFormat(matchFormats);
                response.setCategory(categoryNames);
            }
        }
    }
}
