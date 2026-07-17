package com.athlon.tournament.registration.controller;

import com.athlon.tournament.dto.request.RegistrationCreateRequest;
import com.athlon.tournament.dto.response.ApiResponse;
import com.athlon.tournament.dto.response.RegistrationResponse;
import com.athlon.tournament.registration.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tournament/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<RegistrationResponse>> createRegistration(@Valid @RequestBody RegistrationCreateRequest request) {
        RegistrationResponse response = registrationService.createRegistration(request);
        return new ResponseEntity<>(ApiResponse.success("Registration created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/get/{uuid}")
    public ResponseEntity<ApiResponse<RegistrationResponse>> getRegistrationByUuid(@PathVariable UUID uuid) {
        RegistrationResponse response = registrationService.getRegistrationByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.success("Registration retrieved successfully", response));
    }

    @GetMapping("/get-by-category")
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getRegistrationsByCategory(@RequestParam("categoryId") Long categoryId) {
        List<RegistrationResponse> response = registrationService.getRegistrationsByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success("Registrations retrieved successfully", response));
    }
}
