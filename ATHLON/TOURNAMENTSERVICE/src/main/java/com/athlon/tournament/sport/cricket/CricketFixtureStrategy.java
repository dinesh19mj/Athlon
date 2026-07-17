package com.athlon.tournament.sport.cricket;

import com.athlon.tournament.fixture.entity.Fixture;
import com.athlon.tournament.match.entity.Match;
import com.athlon.tournament.registration.entity.Registration;
import com.athlon.tournament.sport.common.FixtureStrategy;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CricketFixtureStrategy implements FixtureStrategy {

    @Override
    public List<Match> generateMatches(List<Registration> registrations, Fixture fixture) {
        return new ArrayList<>();
    }
}
