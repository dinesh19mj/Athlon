package com.athlon.tournamentservice.sport.common;

import com.athlon.tournamentservice.fixture.entity.Fixture;
import com.athlon.tournamentservice.fixture.entity.FixtureMatch;
import com.athlon.tournamentservice.match.entity.Match;
import com.athlon.tournamentservice.registration.entity.Registration;

import java.util.List;

public interface FixtureStrategy {
    List<Match> generateMatches(List<Registration> registrations, Fixture fixture);
}

