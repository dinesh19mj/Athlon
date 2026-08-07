package com.athlon.tournamentservice.tournament.service;

import com.athlon.tournamentservice.dto.request.TournamentCreateRequest;
import com.athlon.tournamentservice.dto.response.TournamentResponse;
import com.athlon.tournamentservice.exception.ResourceNotFoundException;
import com.athlon.tournamentservice.tournament.entity.Tournament;
import com.athlon.tournamentservice.tournament.repository.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.web.multipart.MultipartFile;
import com.athlon.tournamentservice.util.FileStorageUtil;
import org.springframework.beans.factory.annotation.Value;

@Service
public class TournamentService {

	private final TournamentRepository tournamentRepository;
	private final FileStorageUtil fileStorageUtil;

	@Value("${athlon.tournament.poster.upload.directory}")
	private String posterUploadDir;

	public TournamentService(TournamentRepository tournamentRepository, FileStorageUtil fileStorageUtil) {
		this.tournamentRepository = tournamentRepository;
		this.fileStorageUtil = fileStorageUtil;
	}

	@Transactional
	public TournamentResponse createTournament(TournamentCreateRequest request, MultipartFile poster)
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

		if (poster != null && !poster.isEmpty()) {
			String fileName = fileStorageUtil.saveFileToDir(poster, System.getProperty("tournament"), posterUploadDir);

			tournament.setPoster("/" + posterUploadDir + "/" + fileName);
		}

		Tournament saved = tournamentRepository.save(tournament);
		return TournamentResponse.fromEntity(saved);
	}

	@Transactional(readOnly = true)
	public TournamentResponse getTournamentByUuid(UUID uuid) {
		Tournament tournament = tournamentRepository.findByTournamentUuid(uuid)
				.orElseThrow(() -> new ResourceNotFoundException("Tournament not found with UUID: " + uuid));
		return TournamentResponse.fromEntity(tournament);
	}

	@Transactional(readOnly = true)
	public List<TournamentResponse> getAllActiveTournaments() {
		return tournamentRepository.findAll().stream().filter(Tournament::isActive).map(TournamentResponse::fromEntity)
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<TournamentResponse> getTournamentsByOrganizationUuid(UUID orgUuid) {
		return tournamentRepository.findByOrganizerUuidAndIsActive(orgUuid, 1).stream()
				.map(TournamentResponse::fromEntity).collect(Collectors.toList());
	}

	@Transactional
	public void deactivateTournament(UUID uuid) {
		Tournament tournament = tournamentRepository.findByTournamentUuid(uuid)
				.orElseThrow(() -> new ResourceNotFoundException("Tournament not found with UUID: " + uuid));
		tournament.setActive(false);
		tournamentRepository.save(tournament);
	}
}
