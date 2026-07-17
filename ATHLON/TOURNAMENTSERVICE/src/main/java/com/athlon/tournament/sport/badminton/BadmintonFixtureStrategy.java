package com.athlon.tournament.sport.badminton;

import com.athlon.tournament.fixture.entity.Fixture;
import com.athlon.tournament.match.entity.Match;
import com.athlon.tournament.registration.entity.Registration;
import com.athlon.tournament.sport.common.FixtureStrategy;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class BadmintonFixtureStrategy implements FixtureStrategy {

    @Override
    public List<Match> generateMatches(List<Registration> registrations, Fixture fixture) {
        // Badminton specific pairing logic (e.g., knockout tree)
        return new ArrayList<>();
    }
}
