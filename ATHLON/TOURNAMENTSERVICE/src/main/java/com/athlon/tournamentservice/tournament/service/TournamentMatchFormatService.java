package com.athlon.tournamentservice.tournament.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.tournamentservice.dto.request.TournamentMatchFormatCreateRequest;
import com.athlon.tournamentservice.dto.response.TournamentMatchFormatResponse;
import com.athlon.tournamentservice.exception.ResourceNotFoundException;
import com.athlon.tournamentservice.tournament.entity.TournamentMatchFormat;
import com.athlon.tournamentservice.tournament.repository.TournamentMatchFormatRepository;

@Service
public class TournamentMatchFormatService {

    private final TournamentMatchFormatRepository formatRepository;

    public TournamentMatchFormatService(TournamentMatchFormatRepository formatRepository) {
        this.formatRepository = formatRepository;
    }

    @Transactional
    public TournamentMatchFormatResponse createFormat(TournamentMatchFormatCreateRequest request) {
        TournamentMatchFormat format = new TournamentMatchFormat(
                request.getSportType(),
                request.getFormatName(),
                request.getPlayersPerSide(),
                request.getIsTeamFormat(),
                request.getDisplayOrder()
        );
        TournamentMatchFormat saved = formatRepository.save(format);
        return TournamentMatchFormatResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<TournamentMatchFormatResponse> getFormatsBySport(String sportType) {
        if (sportType == null || sportType.isBlank()) {
            return formatRepository.findByIsActiveOrderByDisplayOrderAsc(1).stream()
                    .map(TournamentMatchFormatResponse::fromEntity)
                    .collect(Collectors.toList());
        }
        return formatRepository.findBySportTypeIgnoreCaseAndIsActiveOrderByDisplayOrderAsc(sportType, 1).stream()
                .map(TournamentMatchFormatResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TournamentMatchFormatResponse getFormatByUuid(UUID formatUuid) {
        TournamentMatchFormat format = formatRepository.findByFormatUuid(formatUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Match format not found with UUID: " + formatUuid));
        return TournamentMatchFormatResponse.fromEntity(format);
    }
}
