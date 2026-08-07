package com.athlon.tournamentservice.sport.volleyball;

import com.athlon.tournamentservice.fixture.entity.Fixture;
import com.athlon.tournamentservice.match.entity.Match;
import com.athlon.tournamentservice.registration.entity.Registration;
import com.athlon.tournamentservice.sport.common.FixtureStrategy;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class VolleyballFixtureStrategy implements FixtureStrategy {

    @Override
    public List<Match> generateMatches(List<Registration> registrations, Fixture fixture) {
        return new ArrayList<>();
    }
}

