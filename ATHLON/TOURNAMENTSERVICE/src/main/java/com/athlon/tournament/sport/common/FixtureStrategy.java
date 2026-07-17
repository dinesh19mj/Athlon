package com.athlon.tournament.sport.common;

import com.athlon.tournament.fixture.entity.Fixture;
import com.athlon.tournament.fixture.entity.FixtureMatch;
import com.athlon.tournament.match.entity.Match;
import com.athlon.tournament.registration.entity.Registration;

import java.util.List;

public interface FixtureStrategy {
    List<Match> generateMatches(List<Registration> registrations, Fixture fixture);
}
