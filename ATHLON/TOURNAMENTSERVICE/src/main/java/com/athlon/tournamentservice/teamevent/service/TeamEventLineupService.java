package com.athlon.tournamentservice.teamevent.service;

import com.athlon.tournamentservice.match.entity.Match;
import com.athlon.tournamentservice.match.repository.MatchRepository;
import com.athlon.tournamentservice.registration.repository.RegistrationRepository;
import com.athlon.tournamentservice.teamevent.entity.TeamEventLineup;
import com.athlon.tournamentservice.teamevent.entity.TeamEventLineupPlayer;
import com.athlon.tournamentservice.teamevent.repository.TeamEventLineupPlayerRepository;
import com.athlon.tournamentservice.teamevent.repository.TeamEventLineupRepository;
import com.athlon.tournamentservice.teamevent.repository.TeamEventCategoryMatchRepository;
import com.athlon.tournamentservice.teamevent.entity.TeamEventCategoryMatch;
import com.athlon.tournamentservice.teamevent.entity.TeamEventRosterPlayer;
import com.athlon.tournamentservice.teamevent.repository.TeamEventRosterPlayerRepository;
import com.athlon.tournamentservice.teamevent.dto.TeamEventFixtureDetailsDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TeamEventLineupService {

    private final TeamEventLineupRepository lineupRepository;
    private final TeamEventLineupPlayerRepository lineupPlayerRepository;
    private final TeamEventCategoryMatchRepository categoryMatchRepository;
    private final com.athlon.tournamentservice.teamevent.repository.TeamEventCategoryRepository categoryRepository;
    private final MatchRepository matchRepository;
    private final TeamEventRosterPlayerRepository rosterPlayerRepository;

    public TeamEventLineupService(
            TeamEventLineupRepository lineupRepository,
            TeamEventLineupPlayerRepository lineupPlayerRepository,
            TeamEventCategoryMatchRepository categoryMatchRepository,
            com.athlon.tournamentservice.teamevent.repository.TeamEventCategoryRepository categoryRepository,
            MatchRepository matchRepository,
            TeamEventRosterPlayerRepository rosterPlayerRepository) {
        this.lineupRepository = lineupRepository;
        this.lineupPlayerRepository = lineupPlayerRepository;
        this.categoryMatchRepository = categoryMatchRepository;
        this.categoryRepository = categoryRepository;
        this.matchRepository = matchRepository;
        this.rosterPlayerRepository = rosterPlayerRepository;
    }

    @Transactional
    public TeamEventLineup submitLineup(Long fixtureMatchId, Long teamRegistrationId, List<TeamEventLineupPlayer> players, Long submittedBy) {
        Match fixture = matchRepository.findById(fixtureMatchId)
                .orElseThrow(() -> new IllegalArgumentException("Fixture not found"));

        if (!fixture.getTeamARegistrationId().equals(teamRegistrationId) && !fixture.getTeamBRegistrationId().equals(teamRegistrationId)) {
            throw new IllegalArgumentException("Team is not part of this fixture");
        }

        // Check deadline (15 mins before scheduled time)
        if (fixture.getScheduledTime() != null) {
            LocalDateTime deadline = fixture.getScheduledTime().minusMinutes(15);
            if (LocalDateTime.now().isAfter(deadline)) {
                throw new IllegalStateException("Lineup submission deadline has passed (15 mins before match)");
            }
        }

        // Validate player eligibility logic
        List<TeamEventRosterPlayer> roster = rosterPlayerRepository.findByTeamRegistrationId(teamRegistrationId);
        List<Long> rosterIds = roster.stream().map(TeamEventRosterPlayer::getRosterPlayerId).toList();
        for (TeamEventLineupPlayer p : players) {
            if (!rosterIds.contains(p.getPlayerRegistrationId())) {
                throw new IllegalArgumentException("Player ID " + p.getPlayerRegistrationId() + " is not in the team's roster");
            }
        }

        Optional<TeamEventLineup> existingOpt = lineupRepository.findByFixtureMatchIdAndTeamRegistrationId(fixtureMatchId, teamRegistrationId);
        TeamEventLineup lineup = existingOpt.orElseGet(TeamEventLineup::new);
        
        if ("APPROVED".equals(lineup.getStatus()) || "LOCKED".equals(lineup.getStatus())) {
            throw new IllegalStateException("Lineup cannot be modified because it is " + lineup.getStatus());
        }

        lineup.setFixtureMatchId(fixtureMatchId);
        lineup.setTeamRegistrationId(teamRegistrationId);
        lineup.setStatus("SUBMITTED");
        lineup.setSubmittedBy(submittedBy);
        lineup.setSubmittedAt(LocalDateTime.now());
        lineup = lineupRepository.save(lineup);

        // Delete old players if resubmitting
        if (existingOpt.isPresent()) {
            List<TeamEventLineupPlayer> oldPlayers = lineupPlayerRepository.findByTeamEventLineupId(lineup.getId());
            lineupPlayerRepository.deleteAll(oldPlayers);
        }

        // Save new players
        for (TeamEventLineupPlayer p : players) {
            p.setTeamEventLineupId(lineup.getId());
            lineupPlayerRepository.save(p);
        }

        return lineup;
    }

    @Transactional
    public TeamEventLineup approveLineup(Long lineupId, Long approvedBy) {
        TeamEventLineup lineup = lineupRepository.findById(lineupId)
                .orElseThrow(() -> new IllegalArgumentException("Lineup not found"));

        lineup.setStatus("APPROVED");
        lineup.setApprovedBy(approvedBy);
        lineup.setApprovedAt(LocalDateTime.now());
        
        return lineupRepository.save(lineup);
    }

    @Transactional
    public TeamEventLineup rejectLineup(Long lineupId, String reason) {
        TeamEventLineup lineup = lineupRepository.findById(lineupId)
                .orElseThrow(() -> new IllegalArgumentException("Lineup not found"));

        lineup.setStatus("REJECTED");
        lineup.setRejectionReason(reason);
        
        return lineupRepository.save(lineup);
    }

    public TeamEventFixtureDetailsDTO getFixtureDetails(Long fixtureMatchId) {
        Match fixture = matchRepository.findById(fixtureMatchId)
                .orElseThrow(() -> new IllegalArgumentException("Fixture not found"));

        TeamEventFixtureDetailsDTO dto = new TeamEventFixtureDetailsDTO();
        dto.setFixtureMatchId(fixtureMatchId);

        List<TeamEventCategoryMatch> categoryMatches = categoryMatchRepository.findByParentMatchIdOrderByMatchOrderAsc(fixtureMatchId);
        for (TeamEventCategoryMatch catMatch : categoryMatches) {
            categoryRepository.findById(catMatch.getTeamEventCategoryId()).ifPresent(cat -> {
                catMatch.setCategoryName(cat.getName());
                catMatch.setMatchFormat(cat.getMatchFormat());
                catMatch.setPlayersRequired(cat.getPlayersRequired());
            });
        }
        dto.setCategoryMatches(categoryMatches);

        if (fixture.getTeamARegistrationId() != null) {
            lineupRepository.findByFixtureMatchIdAndTeamRegistrationId(fixtureMatchId, fixture.getTeamARegistrationId()).ifPresent(lineup -> {
                dto.setTeamALineup(lineup);
                List<TeamEventLineupPlayer> players = lineupPlayerRepository.findByTeamEventLineupId(lineup.getId());
                players.forEach(p -> {
                    rosterPlayerRepository.findById(p.getPlayerRegistrationId())
                            .ifPresent(r -> p.setPlayerName(r.getPlayerName()));
                });
                dto.setTeamALineupPlayers(players);
            });
        }

        if (fixture.getTeamBRegistrationId() != null) {
            lineupRepository.findByFixtureMatchIdAndTeamRegistrationId(fixtureMatchId, fixture.getTeamBRegistrationId()).ifPresent(lineup -> {
                dto.setTeamBLineup(lineup);
                List<TeamEventLineupPlayer> players = lineupPlayerRepository.findByTeamEventLineupId(lineup.getId());
                players.forEach(p -> {
                    rosterPlayerRepository.findById(p.getPlayerRegistrationId())
                            .ifPresent(r -> p.setPlayerName(r.getPlayerName()));
                });
                dto.setTeamBLineupPlayers(players);
            });
        }

        return dto;
    }
}
