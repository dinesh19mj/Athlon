package com.athlon.tournamentservice.drawengine.validation;

import com.athlon.tournamentservice.registration.entity.Registration;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DrawValidationEngine {

    private final List<DrawValidationRule> rules;

    public DrawValidationEngine(List<DrawValidationRule> rules) {
        this.rules = rules;
    }

    /**
     * Runs all applicable validation rules before generating a draw.
     */
    public void validateForDrawGeneration(List<Registration> registrations, Long categoryId) {
        for (DrawValidationRule rule : rules) {
            rule.validate(registrations, categoryId);
        }
    }
}
