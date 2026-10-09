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
import com.athlon.tournamentservice.tournament.entity.TournamentMatchFormat;
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

        if (request.getFormats() != null && !request.getFormats().isEmpty()) {
            int order = 1;
            for (String fmtName : request.getFormats()) {
                if (fmtName == null || fmtName.isBlank()) continue;
                String trimmed = fmtName.trim();
                TournamentMatchFormat newFmt = new TournamentMatchFormat(
                        saved.getSportName(),
                        trimmed,
                        saved.getIsTeamSport() != null && saved.getIsTeamSport() == 1 ? 11 : 1,
                        saved.getIsTeamSport(),
                        order++
                );
                formatRepository.save(newFmt);
            }
        }

        SportResponse res = SportResponse.fromEntity(saved);
        List<TournamentMatchFormatResponse> formats = formatRepository
                .findBySportTypeIgnoreCaseAndIsActiveOrderByDisplayOrderAsc(saved.getSportName(), 1)
                .stream()
                .map(TournamentMatchFormatResponse::fromEntity)
                .collect(Collectors.toList());
        res.setFormats(formats);
        return res;
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

    @Transactional(readOnly = true)
    public List<SportResponse> getAllSports() {
        List<Sport> sports = sportRepository.findAll();
        sports.sort((a, b) -> {
            int ordA = a.getDisplayOrder() != null ? a.getDisplayOrder() : 0;
            int ordB = b.getDisplayOrder() != null ? b.getDisplayOrder() : 0;
            return Integer.compare(ordA, ordB);
        });
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

    @Transactional
    public SportResponse toggleSportStatus(UUID sportUuid) {
        Sport sport = sportRepository.findBySportUuid(sportUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found with UUID: " + sportUuid));
        sport.setIsActive(sport.getIsActive() != null && sport.getIsActive() == 1 ? 0 : 1);
        Sport saved = sportRepository.save(sport);
        SportResponse res = SportResponse.fromEntity(saved);
        List<TournamentMatchFormatResponse> formats = formatRepository
                .findBySportTypeIgnoreCaseAndIsActiveOrderByDisplayOrderAsc(saved.getSportName(), 1)
                .stream()
                .map(TournamentMatchFormatResponse::fromEntity)
                .collect(Collectors.toList());
        res.setFormats(formats);
        return res;
    }

    @Transactional
    public SportResponse updateSport(UUID sportUuid, SportCreateRequest request) {
        Sport sport = sportRepository.findBySportUuid(sportUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found with UUID: " + sportUuid));
        String oldName = sport.getSportName();
        if (request.getSportName() != null && !request.getSportName().isBlank()) {
            sport.setSportName(request.getSportName());
            if (!sport.getSportName().equalsIgnoreCase(oldName)) {
                List<TournamentMatchFormat> existingFmts = formatRepository
                        .findBySportTypeIgnoreCaseAndIsActiveOrderByDisplayOrderAsc(oldName, 1);
                for (TournamentMatchFormat fmt : existingFmts) {
                    fmt.setSportType(sport.getSportName());
                    formatRepository.save(fmt);
                }
            }
        }
        if (request.getSportCode() != null && !request.getSportCode().isBlank()) {
            sport.setSportCode(request.getSportCode());
        }
        if (request.getEmoji() != null) {
            sport.setEmoji(request.getEmoji());
        }
        if (request.getIsTeamSport() != null) {
            sport.setIsTeamSport(request.getIsTeamSport());
        }
        if (request.getSupportsMultiCategory() != null) {
            sport.setSupportsMultiCategory(request.getSupportsMultiCategory());
        }
        if (request.getDefaultFormat() != null) {
            sport.setDefaultFormat(request.getDefaultFormat());
        }
        if (request.getDefaultCategory() != null) {
            sport.setDefaultCategory(request.getDefaultCategory());
        }
        if (request.getCategoryPresets() != null) {
            sport.setCategoryPresets(request.getCategoryPresets());
        }
        if (request.getDisplayOrder() != null) {
            sport.setDisplayOrder(request.getDisplayOrder());
        }
        Sport saved = sportRepository.save(sport);

        if (request.getFormats() != null) {
            List<TournamentMatchFormat> currentFmts = formatRepository
                    .findBySportTypeIgnoreCaseAndIsActiveOrderByDisplayOrderAsc(saved.getSportName(), 1);
            List<String> targetNames = request.getFormats().stream()
                    .filter(f -> f != null && !f.isBlank())
                    .map(String::trim)
                    .collect(Collectors.toList());

            // Deactivate removed formats
            for (TournamentMatchFormat cf : currentFmts) {
                boolean keep = targetNames.stream().anyMatch(t -> t.equalsIgnoreCase(cf.getFormatName()));
                if (!keep) {
                    cf.setIsActive(0);
                    formatRepository.save(cf);
                }
            }

            // Create new formats if not present
            int order = currentFmts.size() + 1;
            for (String tName : targetNames) {
                boolean exists = currentFmts.stream().anyMatch(cf -> cf.getFormatName().equalsIgnoreCase(tName));
                if (!exists) {
                    TournamentMatchFormat newFmt = new TournamentMatchFormat(
                            saved.getSportName(),
                            tName,
                            saved.getIsTeamSport() != null && saved.getIsTeamSport() == 1 ? 11 : 1,
                            saved.getIsTeamSport(),
                            order++
                    );
                    formatRepository.save(newFmt);
                }
            }
        }

        SportResponse res = SportResponse.fromEntity(saved);
        List<TournamentMatchFormatResponse> formats = formatRepository
                .findBySportTypeIgnoreCaseAndIsActiveOrderByDisplayOrderAsc(saved.getSportName(), 1)
                .stream()
                .map(TournamentMatchFormatResponse::fromEntity)
                .collect(Collectors.toList());
        res.setFormats(formats);
        return res;
    }
}
