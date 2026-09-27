package com.athlon.tournamentservice.tournament.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.tournamentservice.dto.request.SportCreateRequest;
import com.athlon.tournamentservice.dto.response.TournamentMatchFormatResponse;
import com.athlon.tournamentservice.dto.response.SportResponse;
import com.athlon.tournamentservice.exception.ResourceNotFoundException;
import com.athlon.tournamentservice.tournament.entity.Sport;
import com.athlon.tournamentservice.tournament.repository.TournamentMatchFormatRepository;
import com.athlon.tournamentservice.tournament.repository.SportRepository;

@Service
public class SportService {

    private final SportRepository sportRepository;
    private final TournamentMatchFormatRepository formatRepository;

    public SportService(SportRepository sportRepository,
                        TournamentMatchFormatRepository formatRepository) {
        this.sportRepository = sportRepository;
        this.formatRepository = formatRepository;
    }

    @Transactional
    public SportResponse createSport(SportCreateRequest request) {
        String code = request.getSportCode();
        if (code == null || code.isBlank()) {
            code = request.getSportName().toUpperCase().replaceAll("[\\s\\-_/]+", "_");
        }

        Sport sport = new Sport(
                request.getSportName(),
                code,
                request.getEmoji(),
                request.getIsTeamSport(),
                request.getSupportsMultiCategory(),
                request.getDefaultFormat(),
                request.getDefaultCategory(),
                request.getCategoryPresets(),
                request.getDisplayOrder()
        );

        Sport saved = sportRepository.save(sport);
        return SportResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<SportResponse> getAllActiveSports() {
        List<Sport> sports = sportRepository.findByIsActiveOrderByDisplayOrderAsc(1);
        return sports.stream().map(sport -> {
            SportResponse res = SportResponse.fromEntity(sport);
            List<TournamentMatchFormatResponse> formats = formatRepository
                    .findBySportTypeIgnoreCaseAndIsActiveOrderByDisplayOrderAsc(sport.getSportName(), 1)
                    .stream()
                    .map(TournamentMatchFormatResponse::fromEntity)
                    .collect(Collectors.toList());
            res.setFormats(formats);
            return res;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SportResponse getSportByUuid(UUID sportUuid) {
        Sport sport = sportRepository.findBySportUuid(sportUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found with UUID: " + sportUuid));
        SportResponse res = SportResponse.fromEntity(sport);
        List<TournamentMatchFormatResponse> formats = formatRepository
                .findBySportTypeIgnoreCaseAndIsActiveOrderByDisplayOrderAsc(sport.getSportName(), 1)
                .stream()
                .map(TournamentMatchFormatResponse::fromEntity)
                .collect(Collectors.toList());
        res.setFormats(formats);
        return res;
    }

    @Transactional(readOnly = true)
    public SportResponse getSportByName(String sportName) {
        Sport sport = sportRepository.findBySportNameIgnoreCase(sportName)
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found with name: " + sportName));
        SportResponse res = SportResponse.fromEntity(sport);
        List<TournamentMatchFormatResponse> formats = formatRepository
                .findBySportTypeIgnoreCaseAndIsActiveOrderByDisplayOrderAsc(sport.getSportName(), 1)
                .stream()
                .map(TournamentMatchFormatResponse::fromEntity)
                .collect(Collectors.toList());
        res.setFormats(formats);
        return res;
    }
}
