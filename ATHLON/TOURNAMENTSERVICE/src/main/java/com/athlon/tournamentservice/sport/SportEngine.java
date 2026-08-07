package com.athlon.tournamentservice.sport;

import com.athlon.tournamentservice.sport.common.SportStrategy;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class SportEngine {

    private final Map<String, SportStrategy> strategyMap;

    public SportEngine(List<SportStrategy> strategies) {
        this.strategyMap = strategies.stream()
                .collect(Collectors.toMap(
                        strategy -> strategy.getSportType().toUpperCase(),
                        Function.identity()
                ));
    }

    public SportStrategy getStrategy(String sportType) {
        if (sportType == null || !strategyMap.containsKey(sportType.toUpperCase())) {
            throw new IllegalArgumentException("Unsupported sport type: " + sportType);
        }
        return strategyMap.get(sportType.toUpperCase());
    }
}

