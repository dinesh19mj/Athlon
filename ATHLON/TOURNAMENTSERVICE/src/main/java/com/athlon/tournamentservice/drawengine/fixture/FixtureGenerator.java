package com.athlon.tournamentservice.drawengine.fixture;

import com.athlon.tournamentservice.match.entity.Match;
import com.athlon.tournamentservice.registration.entity.Registration;
import java.util.List;
import java.util.UUID;

public interface FixtureGenerator {
    
    /**
     * Generates a bracket (list of matches) for the given registrations.
     *
     * @param registrations The approved registrations for the category.
     * @param categoryId The category ID.
     * @param createdBy The user initiating the draw.
     * @param tournamentId The tournament ID.
     * @param tournamentUuid The tournament UUID.
     * @return A list of connected Match entities representing the draw.
     */
    List<Match> generateFixtures(List<Registration> registrations, Long categoryId, Long createdBy, Long tournamentId, UUID tournamentUuid);
}
