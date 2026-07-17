package com.athlon.tournament.court.service;

import com.athlon.tournament.court.entity.Court;
import com.athlon.tournament.court.entity.Venue;
import com.athlon.tournament.court.repository.CourtRepository;
import com.athlon.tournament.court.repository.VenueRepository;
import com.athlon.tournament.dto.request.CourtCreateRequest;
import com.athlon.tournament.dto.request.VenueCreateRequest;
import com.athlon.tournament.dto.response.CourtResponse;
import com.athlon.tournament.dto.response.VenueResponse;
import com.athlon.tournament.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CourtVenueService {

    private final VenueRepository venueRepository;
    private final CourtRepository courtRepository;

    public CourtVenueService(VenueRepository venueRepository, CourtRepository courtRepository) {
        this.venueRepository = venueRepository;
        this.courtRepository = courtRepository;
    }

    @Transactional
    public VenueResponse createVenue(VenueCreateRequest request) {
        Venue venue = new Venue(
                request.getName(),
                request.getAddress(),
                request.getCityId(),
                request.getCityUuid(),
                request.getCreatedBy()
        );
        return VenueResponse.fromEntity(venueRepository.save(venue));
    }

    @Transactional
    public CourtResponse createCourt(CourtCreateRequest request) {
        Court court = new Court(
                request.getVenueId(),
                request.getVenueUuid(),
                request.getName(),
                request.getSportType(),
                request.getCreatedBy()
        );
        return CourtResponse.fromEntity(courtRepository.save(court));
    }

    @Transactional(readOnly = true)
    public VenueResponse getVenueByUuid(UUID uuid) {
        Venue venue = venueRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
        return VenueResponse.fromEntity(venue);
    }

    @Transactional(readOnly = true)
    public List<CourtResponse> getCourtsByVenue(Long venueId) {
        return courtRepository.findByVenueIdAndIsActiveTrue(venueId).stream()
                .map(CourtResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
