package com.athlon.tournamentservice.administration.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.athlon.tournamentservice.administration.entity.JoinRequest;
import com.athlon.tournamentservice.administration.entity.UmpireAssignment;
import com.athlon.tournamentservice.administration.repository.JoinRequestRepository;
import com.athlon.tournamentservice.administration.repository.UmpireAssignmentRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdministrationService {

    @Autowired
    private JoinRequestRepository joinRequestRepository;

    @Autowired
    private UmpireAssignmentRepository umpireAssignmentRepository;

    public JoinRequest submitJoinRequest(JoinRequest request) {
        request.setRequestDate(LocalDateTime.now());
        if (request.getStatus() == null) {
            request.setStatus("PENDING");
        }
        return joinRequestRepository.save(request);
    }

    public JoinRequest updateJoinRequestStatus(Long requestId, String status) {
        JoinRequest request = joinRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(status);
        return joinRequestRepository.save(request);
    }

    public List<JoinRequest> getJoinRequestsByOrg(Long orgId) {
        return joinRequestRepository.findByOrgId(orgId);
    }

    public UmpireAssignment assignUmpire(UmpireAssignment assignment) {
        assignment.setCreatedOn(LocalDateTime.now());
        if (assignment.getStatus() == null) {
            assignment.setStatus("ASSIGNED");
        }
        return umpireAssignmentRepository.save(assignment);
    }

    public UmpireAssignment updateUmpireStatus(Long assignmentId, String status) {
        UmpireAssignment assignment = umpireAssignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new RuntimeException("Assignment not found"));
        assignment.setStatus(status);
        return umpireAssignmentRepository.save(assignment);
    }

    public List<UmpireAssignment> getUmpireAssignmentsByTournament(Long tournamentId) {
        return umpireAssignmentRepository.findByTournamentId(tournamentId);
    }
}

