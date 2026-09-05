package com.athlon.tournamentservice.match.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.tournamentservice.match.entity.ClubMatch;
import com.athlon.tournamentservice.match.service.ClubMatchService;

import java.util.List;

@RestController
@RequestMapping({"/api/tournament/clubmatch", "/clubmatch"})
public class ClubMatchController {

    @Autowired
    private ClubMatchService clubMatchService;

    @PostMapping("/add")
    public ResponseEntity<ClubMatch> createMatch(@RequestBody ClubMatch match) {
        try {
            ClubMatch saved = clubMatchService.createMatch(match);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/updateScore/{matchId}")
    public ResponseEntity<ClubMatch> updateScore(
            @PathVariable("matchId") Long matchId,
            @RequestParam("score") String score,
            @RequestParam(value = "status", required = false) String status) {
        try {
            ClubMatch updated = clubMatchService.updateScore(matchId, score, status);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/org/{orgIdentifier}")
    public ResponseEntity<List<ClubMatch>> getMatchesByOrg(@PathVariable("orgIdentifier") String orgIdentifier) {
        try {
            List<ClubMatch> matches = clubMatchService.getMatchesByOrgIdentifier(orgIdentifier);
            return new ResponseEntity<>(matches, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/delete/{matchId}")
    public ResponseEntity<Void> deleteMatch(@PathVariable("matchId") Long matchId) {
        try {
            clubMatchService.deleteMatch(matchId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
