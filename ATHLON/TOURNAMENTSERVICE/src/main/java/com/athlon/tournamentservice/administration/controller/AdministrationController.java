package com.athlon.tournamentservice.administration.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.tournamentservice.administration.entity.JoinRequest;
import com.athlon.tournamentservice.administration.entity.UmpireAssignment;
import com.athlon.tournamentservice.administration.service.AdministrationService;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdministrationController {

    @Autowired
    private AdministrationService administrationService;

    @PostMapping("/join/request")
    public ResponseEntity<JoinRequest> submitJoinRequest(@RequestBody JoinRequest request) {
        try {
            JoinRequest saved = administrationService.submitJoinRequest(request);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/join/update/{requestId}")
    public ResponseEntity<JoinRequest> updateJoinRequestStatus(
            @PathVariable("requestId") Long requestId,
            @RequestParam("status") String status) {
        try {
            JoinRequest updated = administrationService.updateJoinRequestStatus(requestId, status);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/join/org/{orgId}")
    public ResponseEntity<List<JoinRequest>> getJoinRequestsByOrg(@PathVariable("orgId") Long orgId) {
        try {
            List<JoinRequest> requests = administrationService.getJoinRequestsByOrg(orgId);
            return new ResponseEntity<>(requests, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/umpire/assign")
    public ResponseEntity<UmpireAssignment> assignUmpire(@RequestBody UmpireAssignment assignment) {
        try {
            UmpireAssignment saved = administrationService.assignUmpire(assignment);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/umpire/tournament/{tournamentId}")
    public ResponseEntity<List<UmpireAssignment>> getAssignmentsByTournament(@PathVariable("tournamentId") Long tournamentId) {
        try {
            List<UmpireAssignment> assignments = administrationService.getUmpireAssignmentsByTournament(tournamentId);
            return new ResponseEntity<>(assignments, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

