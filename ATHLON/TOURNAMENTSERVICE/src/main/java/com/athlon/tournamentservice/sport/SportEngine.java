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
        if (sportType == null) {
            throw new IllegalArgumentException("Sport type cannot be null");
        }
        String upper = sportType.toUpperCase();
        if (strategyMap.containsKey(upper)) {
            return strategyMap.get(upper);
        }
        if (upper.contains("BADMINTON") || upper.equals("SINGLES") || upper.equals("DOUBLES") || upper.equals("MIXED DOUBLES")) {
            return strategyMap.get("BADMINTON");
        }
        if (upper.contains("FOOTBALL") || upper.contains("SOCCER")) {
            return strategyMap.get("FOOTBALL");
        }
        if (upper.contains("VOLLEYBALL")) {
            return strategyMap.get("VOLLEYBALL");
        }
        if (upper.contains("CRICKET")) {
            return strategyMap.get("CRICKET");
        }
        throw new IllegalArgumentException("Unsupported sport type: " + sportType);
    }
}

