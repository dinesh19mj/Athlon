package com.athlon.tournamentservice.drawengine.validation;

import com.athlon.tournamentservice.registration.entity.Registration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DrawValidationEngine {

    private final List<DrawValidationRule> rules;

    public DrawValidationEngine() {
        this.rules = new ArrayList<>();
    }

    @Autowired(required = false)
    public DrawValidationEngine(List<DrawValidationRule> rules) {
        this.rules = rules != null ? rules : new ArrayList<>();
    }

    /**
     * Runs all applicable validation rules before generating a draw.
     */
    public void validateForDrawGeneration(List<Registration> registrations, Long categoryId) {
        if (rules != null) {
            for (DrawValidationRule rule : rules) {
                rule.validate(registrations, categoryId);
            }
        }
    }
}
