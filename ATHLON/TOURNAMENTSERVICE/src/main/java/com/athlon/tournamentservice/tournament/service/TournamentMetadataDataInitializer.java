package com.athlon.tournamentservice.tournament.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.athlon.tournamentservice.tournament.entity.Sport;
import com.athlon.tournamentservice.tournament.entity.TournamentMatchFormat;
import com.athlon.tournamentservice.tournament.repository.SportRepository;
import com.athlon.tournamentservice.tournament.repository.TournamentMatchFormatRepository;

@Component
public class TournamentMetadataDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(TournamentMetadataDataInitializer.class);

    private final SportRepository sportRepository;
    private final TournamentMatchFormatRepository formatRepository;

    public TournamentMetadataDataInitializer(SportRepository sportRepository,
                                             TournamentMatchFormatRepository formatRepository) {
        this.sportRepository = sportRepository;
        this.formatRepository = formatRepository;
    }

    @Override
    public void run(String... args) {
        try {
            seedSportsAndFormats();
        } catch (Exception e) {
            log.warn("Tournament metadata seeding notice: {}", e.getMessage());
        }
    }

    private void seedSportsAndFormats() {
        // 1. Badminton
        initSport("Badminton", "BADMINTON", "🏸", 0, 1, "Men's Singles", "Open Category",
                "Open Category,Beginner,Intermediate,Advanced,C Level,35+ Veterans,45+ Veterans,Under-13,Under-15,Under-17,Under-19",
                1,
                new String[]{"Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"},
                new int[]{1, 1, 2, 2, 2},
                new int[]{0, 0, 0, 0, 0});

        // 2. Cricket
        initSport("Cricket", "CRICKET", "🏏", 1, 0, "T20 (20 Overs)", "Open Championship",
                "Open Championship,Under-19,Under-16,Under-14,Corporate Cup,Veterans (35+),Division A,Division B,Box Cricket League",
                2,
                new String[]{"T20 (20 Overs)", "T10 (10 Overs)", "Box Cricket (6-8 Overs)", "11-a-side Full Match", "8-a-side Tournament", "6-a-side Gully / Turf", "100 Balls Tournament", "Leather Ball Open", "Tape Ball Open"},
                new int[]{11, 11, 8, 11, 8, 6, 11, 11, 11},
                new int[]{1, 1, 1, 1, 1, 1, 1, 1, 1});

        // 3. Football
        initSport("Football", "FOOTBALL", "⚽", 1, 0, "7 vs 7 (Turf / Field)", "Open Men's",
                "Open Men's,Open Women's,Under-19,Under-17,Under-15,Corporate Cup,Veterans (35+)",
                3,
                new String[]{"7 vs 7 (Turf / Field)", "5 vs 5 (Futsal / Turf)", "11 vs 11 (Full Pitch)", "6 vs 6", "8 vs 8", "Penalty Shootout Cup"},
                new int[]{7, 5, 11, 6, 8, 1},
                new int[]{1, 1, 1, 1, 1, 0});

        // 4. Tennis
        initSport("Tennis", "TENNIS", "🎾", 0, 0, "Men's Singles", "Open Championship",
                "Open Championship,Beginner / Level 1,Intermediate / Level 2,Advanced / Open,Under-18,Under-14,35+ Masters,45+ Masters",
                4,
                new String[]{"Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"},
                new int[]{1, 1, 2, 2, 2},
                new int[]{0, 0, 0, 0, 0});

        // 5. Table Tennis
        initSport("Table Tennis", "TABLE_TENNIS", "🏓", 0, 0, "Men's Singles", "Open Championship",
                "Open Championship,Beginner,Intermediate,Advanced,Under-19,Under-15,Veterans (40+)",
                5,
                new String[]{"Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles", "Team Event (Singles + Doubles)"},
                new int[]{1, 1, 2, 2, 2, 4},
                new int[]{0, 0, 0, 0, 0, 1});

        // 6. Pickleball
        initSport("Pickleball", "PICKLEBALL", "🏓", 0, 0, "Open Doubles (Any Gender)", "Open (Skill 3.5+)",
                "Open (Skill 3.5+),Intermediate (Skill 2.5-3.5),Beginner (Skill < 2.5),35+ Masters,50+ Masters",
                6,
                new String[]{"Open Doubles (Any Gender)", "Men's Doubles", "Women's Doubles", "Mixed Doubles", "Men's Singles", "Women's Singles"},
                new int[]{2, 2, 2, 2, 1, 1},
                new int[]{0, 0, 0, 0, 0, 0});

        // 7. Basketball
        initSport("Basketball", "BASKETBALL", "🏀", 1, 0, "5 vs 5 (Full Court)", "Open Men's",
                "Open Men's,Open Women's,Under-19,Under-17,Corporate League",
                7,
                new String[]{"5 vs 5 (Full Court)", "3x3 (Half Court)", "Open Team Tournament"},
                new int[]{5, 3, 5},
                new int[]{1, 1, 1});

        // 8. Volleyball
        initSport("Volleyball", "VOLLEYBALL", "🏐", 1, 0, "6-a-side Standard (Indoor)", "Open Men's",
                "Open Men's,Open Women's,Under-19,Corporate Cup",
                8,
                new String[]{"6-a-side Standard (Indoor)", "2-a-side Beach Volleyball", "4-a-side Volleyball", "Open Team Tournament"},
                new int[]{6, 2, 4, 6},
                new int[]{1, 1, 1, 1});

        // 9. Squash
        initSport("Squash", "SQUASH", "🎯", 0, 0, "Men's Singles", "Open Championship",
                "Open Championship,Intermediate / B Level,Beginner / C Level,Veterans (35+)",
                9,
                new String[]{"Men's Singles", "Women's Singles", "Mixed Singles / Open", "Doubles"},
                new int[]{1, 1, 1, 2},
                new int[]{0, 0, 0, 0});

        // 10. Chess
        initSport("Chess", "CHESS", "♟️", 0, 0, "Rapid (15m + 10s)", "Open Championship",
                "Open Championship,Under-16,Under-12,Under-9,Unrated / Beginner,FIDE Rated Open",
                10,
                new String[]{"Rapid (15m + 10s)", "Blitz (3m + 2s)", "Classical (90m + 30s)", "Bullet (1m + 0s)", "Swiss League Tournament"},
                new int[]{1, 1, 1, 1, 1},
                new int[]{0, 0, 0, 0, 0});

        // 11. Athletics
        initSport("Athletics", "ATHLETICS", "🏃", 0, 0, "5K Run", "Open Men (18-35)",
                "Open Men (18-35),Open Women (18-35),Masters (35-50),Veterans (50+),Junior (Under-18)",
                11,
                new String[]{"5K Run", "10K Run", "Half Marathon (21K)", "Full Marathon (42K)", "100m Sprint", "200m Sprint", "400m Sprint", "4x100m Relay"},
                new int[]{1, 1, 1, 1, 1, 1, 1, 4},
                new int[]{0, 0, 0, 0, 0, 0, 0, 1});

        // 12. Swimming
        initSport("Swimming", "SWIMMING", "🏊", 0, 0, "50m Freestyle", "Open Men",
                "Open Men,Open Women,Under-16,Under-14,Under-12",
                12,
                new String[]{"50m Freestyle", "100m Freestyle", "50m Breaststroke", "50m Backstroke", "50m Butterfly", "200m Individual Medley"},
                new int[]{1, 1, 1, 1, 1, 1},
                new int[]{0, 0, 0, 0, 0, 0});
    }

    private void initSport(String sportName, String sportCode, String emoji, int isTeamSport, int supportsMultiCategory,
                           String defaultFormat, String defaultCategory, String presets, int displayOrder,
                           String[] formatNames, int[] playersPerSide, int[] isTeamFormat) {
        if (!sportRepository.existsBySportNameIgnoreCase(sportName)) {
            Sport sport = new Sport(sportName, sportCode, emoji, isTeamSport,
                    supportsMultiCategory, defaultFormat, defaultCategory, presets, displayOrder);
            sportRepository.save(sport);
        }

        for (int i = 0; i < formatNames.length; i++) {
            String fName = formatNames[i];
            if (!formatRepository.existsBySportTypeIgnoreCaseAndFormatNameIgnoreCase(sportName, fName)) {
                int pSide = i < playersPerSide.length ? playersPerSide[i] : 1;
                int tFormat = i < isTeamFormat.length ? isTeamFormat[i] : 0;
                TournamentMatchFormat format = new TournamentMatchFormat(sportName, fName, pSide, tFormat, i + 1);
                formatRepository.save(format);
            }
        }
    }
}
