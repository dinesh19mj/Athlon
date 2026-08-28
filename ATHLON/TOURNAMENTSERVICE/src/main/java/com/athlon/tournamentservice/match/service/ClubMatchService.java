package com.athlon.tournamentservice.match.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.athlon.tournamentservice.match.entity.ClubMatch;
import com.athlon.tournamentservice.match.repository.ClubMatchRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClubMatchService {

    @Autowired
    private ClubMatchRepository clubMatchRepository;

    public ClubMatch createMatch(ClubMatch match) {
        match.setCreatedOn(LocalDateTime.now());
        if (match.getStatus() == null || match.getStatus().trim().isEmpty()) {
            match.setStatus("COMPLETED");
        }
        return clubMatchRepository.save(match);
    }

    public ClubMatch updateScore(Long matchId, String score, String status) {
        ClubMatch match = clubMatchRepository.findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));
        match.setScore(score);
        if (status != null && !status.trim().isEmpty()) {
            match.setStatus(status);
        }
        return clubMatchRepository.save(match);
    }

    public List<ClubMatch> getMatchesByOrg(Long orgId) {
        return clubMatchRepository.findByOrgIdOrderByMatchDateDesc(orgId);
    }

    public List<ClubMatch> getMatchesByOrgIdentifier(String orgIdentifier) {
        if (orgIdentifier == null || orgIdentifier.trim().isEmpty()) {
            return List.of();
        }
        try {
            Long numericOrgId = Long.parseLong(orgIdentifier);
            List<ClubMatch> list = clubMatchRepository.findByOrgIdOrderByMatchDateDesc(numericOrgId);
            if (!list.isEmpty()) {
                return list;
            }
        } catch (NumberFormatException ignored) {
        }
        return clubMatchRepository.findByOrgUuidOrderByMatchDateDesc(orgIdentifier);
    }

    public void deleteMatch(Long matchId) {
        clubMatchRepository.deleteById(matchId);
    }
}
