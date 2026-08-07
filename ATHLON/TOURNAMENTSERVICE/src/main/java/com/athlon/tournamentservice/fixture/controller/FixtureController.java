package com.athlon.tournamentservice.fixture.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.tournamentservice.fixture.entity.Fixture;
import com.athlon.tournamentservice.fixture.entity.FixtureMatch;
import com.athlon.tournamentservice.fixture.service.FixtureService;

import java.util.List;

@RestController
@RequestMapping("/tournament/fixtures")
public class FixtureController {

    @Autowired
    private FixtureService fixtureService;

    @PostMapping("/create")
    public ResponseEntity<Fixture> createFixture(@RequestBody Fixture fixture) {
        try {
            Fixture saved = fixtureService.createFixture(fixture);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Fixture>> getFixturesByCategory(@PathVariable("categoryId") Long categoryId) {
        try {
            List<Fixture> fixtures = fixtureService.getFixturesByCategory(categoryId);
            return new ResponseEntity<>(fixtures, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/match/create")
    public ResponseEntity<FixtureMatch> createFixtureMatch(@RequestBody FixtureMatch match) {
        try {
            FixtureMatch saved = fixtureService.createFixtureMatch(match);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/match/fixture/{fixtureId}")
    public ResponseEntity<List<FixtureMatch>> getMatchesByFixture(@PathVariable("fixtureId") Long fixtureId) {
        try {
            List<FixtureMatch> matches = fixtureService.getMatchesByFixture(fixtureId);
            return new ResponseEntity<>(matches, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

