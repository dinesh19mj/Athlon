package com.athlon.tournamentservice.teamchampionship.service;

import com.athlon.tournamentservice.teamchampionship.dto.request.LineupEntryDTO;
import com.athlon.tournamentservice.teamchampionship.dto.request.RecordSubstitutionRequest;
import com.athlon.tournamentservice.teamchampionship.dto.request.RecordTossRequest;
import com.athlon.tournamentservice.teamchampionship.dto.request.SubmitLineupRequest;
import com.athlon.tournamentservice.teamchampionship.dto.response.LineupDetailDTO;
import com.athlon.tournamentservice.teamchampionship.dto.response.TeamFixtureDetailDTO;
import com.athlon.tournamentservice.teamchampionship.entity.*;
import com.athlon.tournamentservice.teamchampionship.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeamChampionshipLineupService {

    private final TeamChampionshipFixtureRepository fixtureRepository;
    private final TeamChampionshipSubMatchRepository subMatchRepository;
    private final TeamChampionshipLineupRepository lineupRepository;
    private final TeamChampionshipLineupEntryRepository lineupEntryRepository;
    private final TeamChampionshipTossRepository tossRepository;
    private final TeamChampionshipSubstitutionRepository substitutionRepository;
    private final ChampionshipSquadRepository squadRepository;
    private final ChampionshipRulesConfigRepository rulesConfigRepository;

    @Autowired
    public TeamChampionshipLineupService(
            TeamChampionshipFixtureRepository fixtureRepository,
            TeamChampionshipSubMatchRepository subMatchRepository,
            TeamChampionshipLineupRepository lineupRepository,
            TeamChampionshipLineupEntryRepository lineupEntryRepository,
            TeamChampionshipTossRepository tossRepository,
            TeamChampionshipSubstitutionRepository substitutionRepository,
            ChampionshipSquadRepository squadRepository,
            ChampionshipRulesConfigRepository rulesConfigRepository) {
        this.fixtureRepository = fixtureRepository;
        this.subMatchRepository = subMatchRepository;
        this.lineupRepository = lineupRepository;
        this.lineupEntryRepository = lineupEntryRepository;
        this.tossRepository = tossRepository;
        this.substitutionRepository = substitutionRepository;
        this.squadRepository = squadRepository;
        this.rulesConfigRepository = rulesConfigRepository;
    }

    @Transactional
    public TeamChampionshipLineup submitLineup(SubmitLineupRequest request) {
        TeamChampionshipFixture fixture = fixtureRepository.findById(request.getFixtureId())
                .orElseThrow(() -> new IllegalArgumentException("Fixture not found"));

        if (!fixture.getTeamAId().equals(request.getTeamId()) && !fixture.getTeamBId().equals(request.getTeamId())) {
            throw new IllegalArgumentException("Team does not participate in this fixture");
        }

        // Validate all players belong to this team's squad
        List<ChampionshipSquad> teamSquad = squadRepository.findByTeamId(request.getTeamId());
        Set<Long> validSquadPlayerIds = teamSquad.stream().map(ChampionshipSquad::getPlayerId).collect(Collectors.toSet());

        for (LineupEntryDTO entry : request.getEntries()) {
            if (!validSquadPlayerIds.contains(entry.getPlayerId())) {
                throw new IllegalArgumentException("Player " + entry.getPlayerName() + " (ID: " + entry.getPlayerId() + ") does not belong to this team squad");
            }
        }

        // Check if existing lineup exists to increment version
        Optional<TeamChampionshipLineup> existingLineupOpt = lineupRepository.findByFixtureIdAndTeamId(fixture.getFixtureId(), request.getTeamId());
        TeamChampionshipLineup lineup;
        int newVersion = 1;

        if (existingLineupOpt.isPresent()) {
            lineup = existingLineupOpt.get();
            newVersion = lineup.getVersion() + 1;
            lineup.setVersion(newVersion);
            lineup.setStatus("SUBMITTED");
            lineupEntryRepository.deleteByLineupId(lineup.getLineupId());
        } else {
            lineup = new TeamChampionshipLineup();
            lineup.setFixtureId(fixture.getFixtureId());
            lineup.setTeamId(request.getTeamId());
            lineup.setVersion(1);
            lineup.setStatus("SUBMITTED");
        }

        lineup.setSubmittedByUserId(request.getSubmittedByUserId());
        lineup.setPreferredCategoryOrder(request.getPreferredCategoryOrder());
        TeamChampionshipLineup savedLineup = lineupRepository.save(lineup);

        for (LineupEntryDTO entry : request.getEntries()) {
            TeamChampionshipLineupEntry le = new TeamChampionshipLineupEntry();
            le.setLineupId(savedLineup.getLineupId());
            le.setEventId(entry.getEventId());
            le.setEventName(entry.getEventName());
            le.setPlayerId(entry.getPlayerId());
            le.setPlayerName(entry.getPlayerName());
            le.setPlayerPosition(entry.getPlayerPosition() != null ? entry.getPlayerPosition() : 1);
            le.setIsSubstitute(entry.getIsSubstitute() != null ? entry.getIsSubstitute() : false);
            lineupEntryRepository.save(le);
        }

        // Update fixture status if both lineups submitted
        List<TeamChampionshipLineup> lineups = lineupRepository.findByFixtureId(fixture.getFixtureId());
        if (lineups.size() >= 2) {
            fixture.setStatus("LINEUPS_SUBMITTED");
            fixtureRepository.save(fixture);
        }

        return savedLineup;
    }

    @Transactional
    public TeamChampionshipLineup approveLineup(Long lineupId) {
        TeamChampionshipLineup lineup = lineupRepository.findById(lineupId)
                .orElseThrow(() -> new IllegalArgumentException("Lineup not found"));
        lineup.setStatus("APPROVED");
        TeamChampionshipLineup saved = lineupRepository.save(lineup);

        // Synchronize player names into SubMatches if both teams are approved
        TeamChampionshipFixture fixture = fixtureRepository.findById(lineup.getFixtureId()).orElse(null);
        if (fixture != null) {
            List<TeamChampionshipLineup> allLineups = lineupRepository.findByFixtureId(fixture.getFixtureId());
            boolean allApproved = allLineups.size() >= 2 && allLineups.stream().allMatch(l -> "APPROVED".equalsIgnoreCase(l.getStatus()));

            if (allApproved) {
                applyLineupsToSubMatches(fixture);
            }
        }

        return saved;
    }

    @Transactional
    public TeamChampionshipLineup rejectLineup(Long lineupId, String reason) {
        TeamChampionshipLineup lineup = lineupRepository.findById(lineupId)
                .orElseThrow(() -> new IllegalArgumentException("Lineup not found"));
        lineup.setStatus("REJECTED");
        lineup.setRejectionReason(reason);
        return lineupRepository.save(lineup);
    }

    private void applyLineupsToSubMatches(TeamChampionshipFixture fixture) {
        List<TeamChampionshipSubMatch> subMatches = subMatchRepository.findByFixtureIdOrderByOrderSequenceAsc(fixture.getFixtureId());
        Optional<TeamChampionshipLineup> teamALineupOpt = lineupRepository.findByFixtureIdAndTeamId(fixture.getFixtureId(), fixture.getTeamAId());
        Optional<TeamChampionshipLineup> teamBLineupOpt = lineupRepository.findByFixtureIdAndTeamId(fixture.getFixtureId(), fixture.getTeamBId());

        if (teamALineupOpt.isPresent() && teamBLineupOpt.isPresent()) {
            List<TeamChampionshipLineupEntry> teamAEntries = lineupEntryRepository.findByLineupId(teamALineupOpt.get().getLineupId());
            List<TeamChampionshipLineupEntry> teamBEntries = lineupEntryRepository.findByLineupId(teamBLineupOpt.get().getLineupId());

            for (TeamChampionshipSubMatch sm : subMatches) {
                String teamAPlayers = teamAEntries.stream()
                        .filter(e -> e.getEventId().equals(sm.getEventId()))
                        .map(TeamChampionshipLineupEntry::getPlayerName)
                        .collect(Collectors.joining(", "));

                String teamBPlayers = teamBEntries.stream()
                        .filter(e -> e.getEventId().equals(sm.getEventId()))
                        .map(TeamChampionshipLineupEntry::getPlayerName)
                        .collect(Collectors.joining(", "));

                sm.setTeamAPlayers(teamAPlayers);
                sm.setTeamBPlayers(teamBPlayers);
                subMatchRepository.save(sm);
            }
        }
    }

    @Transactional
    public TeamChampionshipToss recordToss(RecordTossRequest request) {
        TeamChampionshipFixture fixture = fixtureRepository.findById(request.getFixtureId())
                .orElseThrow(() -> new IllegalArgumentException("Fixture not found"));

        TeamChampionshipToss toss = tossRepository.findByFixtureId(request.getFixtureId())
                .orElse(new TeamChampionshipToss());

        toss.setFixtureId(fixture.getFixtureId());
        toss.setTossWinnerTeamId(request.getTossWinnerTeamId());
        toss.setTossWinnerTeamName(request.getTossWinnerTeamId().equals(fixture.getTeamAId()) ? fixture.getTeamAName() : fixture.getTeamBName());
        toss.setDecision(request.getDecision());
        toss.setSelectedOrder(request.getSelectedOrder());
        toss.setConductedByUserId(request.getConductedByUserId());

        TeamChampionshipToss savedToss = tossRepository.save(toss);

        fixture.setTossWinnerTeamId(request.getTossWinnerTeamId());
        fixtureRepository.save(fixture);

        // If category order was chosen in toss, rearrange SubMatches order
        if (request.getSelectedOrder() != null && !request.getSelectedOrder().trim().isEmpty()) {
            String[] eventIdStrs = request.getSelectedOrder().split(",");
            List<TeamChampionshipSubMatch> subMatches = subMatchRepository.findByFixtureIdOrderByOrderSequenceAsc(fixture.getFixtureId());
            for (int i = 0; i < eventIdStrs.length; i++) {
                try {
                    Long evId = Long.parseLong(eventIdStrs[i].trim());
                    for (TeamChampionshipSubMatch sm : subMatches) {
                        if (sm.getEventId().equals(evId)) {
                            sm.setOrderSequence(i + 1);
                            subMatchRepository.save(sm);
                            break;
                        }
                    }
                } catch (NumberFormatException ignored) {}
            }
        }

        return savedToss;
    }

    @Transactional
    public TeamChampionshipSubstitution recordSubstitution(RecordSubstitutionRequest request) {
        TeamChampionshipSubstitution sub = new TeamChampionshipSubstitution();
        sub.setFixtureId(request.getFixtureId());
        sub.setSubMatchId(request.getSubMatchId());
        sub.setTeamId(request.getTeamId());
        sub.setOriginalPlayerId(request.getOriginalPlayerId());
        sub.setOriginalPlayerName(request.getOriginalPlayerName());
        sub.setReplacementPlayerId(request.getReplacementPlayerId());
        sub.setReplacementPlayerName(request.getReplacementPlayerName());
        sub.setReason(request.getReason() != null ? request.getReason() : "TACTICAL");
        sub.setApprovedByUserId(request.getApprovedByUserId());

        TeamChampionshipSubstitution saved = substitutionRepository.save(sub);

        // Update SubMatch player string
        TeamChampionshipSubMatch subMatch = subMatchRepository.findById(request.getSubMatchId()).orElse(null);
        if (subMatch != null) {
            TeamChampionshipFixture fixture = fixtureRepository.findById(request.getFixtureId()).orElse(null);
            if (fixture != null) {
                if (request.getTeamId().equals(fixture.getTeamAId()) && subMatch.getTeamAPlayers() != null) {
                    subMatch.setTeamAPlayers(subMatch.getTeamAPlayers().replace(request.getOriginalPlayerName(), request.getReplacementPlayerName()));
                } else if (request.getTeamId().equals(fixture.getTeamBId()) && subMatch.getTeamBPlayers() != null) {
                    subMatch.setTeamBPlayers(subMatch.getTeamBPlayers().replace(request.getOriginalPlayerName(), request.getReplacementPlayerName()));
                }
                subMatchRepository.save(subMatch);
            }
        }

        return saved;
    }

    public TeamFixtureDetailDTO getFixtureDetail(Long fixtureId, boolean isOrganizer) {
        TeamChampionshipFixture fixture = fixtureRepository.findById(fixtureId)
                .orElseThrow(() -> new IllegalArgumentException("Fixture not found"));

        TeamFixtureDetailDTO dto = new TeamFixtureDetailDTO();
        dto.setFixture(fixture);
        dto.setSubMatches(subMatchRepository.findByFixtureIdOrderByOrderSequenceAsc(fixtureId));
        dto.setToss(tossRepository.findByFixtureId(fixtureId).orElse(null));

        Optional<TeamChampionshipLineup> teamALineup = lineupRepository.findByFixtureIdAndTeamId(fixtureId, fixture.getTeamAId());
        Optional<TeamChampionshipLineup> teamBLineup = lineupRepository.findByFixtureIdAndTeamId(fixtureId, fixture.getTeamBId());

        dto.setTeamALineupSubmitted(teamALineup.isPresent());
        dto.setTeamBLineupSubmitted(teamBLineup.isPresent());

        // Simultaneous reveal check: reveal only if both submitted and approved or if viewer is organizer
        boolean bothApproved = teamALineup.isPresent() && "APPROVED".equalsIgnoreCase(teamALineup.get().getStatus())
                && teamBLineup.isPresent() && "APPROVED".equalsIgnoreCase(teamBLineup.get().getStatus());

        dto.setLineupsRevealed(isOrganizer || bothApproved);

        return dto;
    }

    public List<LineupDetailDTO> getLineupsForFixture(Long fixtureId) {
        List<TeamChampionshipLineup> lineups = lineupRepository.findByFixtureId(fixtureId);
        return lineups.stream().map(l -> {
            List<TeamChampionshipLineupEntry> entries = lineupEntryRepository.findByLineupId(l.getLineupId());
            return new LineupDetailDTO(l, entries);
        }).collect(Collectors.toList());
    }
}
