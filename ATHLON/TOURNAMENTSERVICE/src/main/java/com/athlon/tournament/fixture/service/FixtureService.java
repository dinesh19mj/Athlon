package com.athlon.tournament.fixture.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.athlon.tournament.fixture.entity.Fixture;
import com.athlon.tournament.fixture.entity.FixtureMatch;
import com.athlon.tournament.fixture.repository.FixtureRepository;
import com.athlon.tournament.fixture.repository.FixtureMatchRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class FixtureService {

    @Autowired
    private FixtureRepository fixtureRepository;

    @Autowired
    private FixtureMatchRepository fixtureMatchRepository;

    public Fixture createFixture(Fixture fixture) {
        return fixtureRepository.save(fixture);
    }

    public List<Fixture> getFixturesByCategory(Long categoryId) {
        return fixtureRepository.findByCategoryIdAndIsActiveTrue(categoryId);
    }

    public FixtureMatch createFixtureMatch(FixtureMatch match) {
        return fixtureMatchRepository.save(match);
    }

    public List<FixtureMatch> getMatchesByFixture(Long fixtureId) {
        return fixtureMatchRepository.findByFixtureIdAndIsActiveTrue(fixtureId);
    }
}
