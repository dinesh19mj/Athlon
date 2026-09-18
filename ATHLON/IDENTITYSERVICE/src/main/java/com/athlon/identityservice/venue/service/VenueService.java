package com.athlon.identityservice.venue.service;

import com.athlon.identityservice.venue.dto.VenueCreateRequest;
import com.athlon.identityservice.venue.dto.VenueDto;
import com.athlon.identityservice.venue.entity.Venue;
import com.athlon.identityservice.venue.entity.VenueAmenity;
import com.athlon.identityservice.venue.entity.VenueImage;
import com.athlon.identityservice.venue.entity.VenueOperatingHour;
import com.athlon.identityservice.venue.enums.VenueStatus;
import com.athlon.identityservice.venue.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VenueService {

    private final VenueRepository venueRepository;
    private final VenueOperatingHourRepository operatingHourRepository;
    private final VenueAmenityRepository amenityRepository;
    private final VenueImageRepository imageRepository;
    private final VenueFacilityRepository facilityRepository;
    private final com.athlon.identityservice.organization.repository.OrganizationRepository organizationRepository;

    public VenueService(
            VenueRepository venueRepository,
            VenueOperatingHourRepository operatingHourRepository,
            VenueAmenityRepository amenityRepository,
            VenueImageRepository imageRepository,
            VenueFacilityRepository facilityRepository,
            com.athlon.identityservice.organization.repository.OrganizationRepository organizationRepository
    ) {
        this.venueRepository = venueRepository;
        this.operatingHourRepository = operatingHourRepository;
        this.amenityRepository = amenityRepository;
        this.imageRepository = imageRepository;
        this.facilityRepository = facilityRepository;
        this.organizationRepository = organizationRepository;
    }

    @Transactional
    public VenueDto createVenue(VenueCreateRequest request, Long performedByUserId) {
        Venue venue = new Venue();
        venue.setOrganizationId(request.getOrganizationId());
        venue.setOrganizationUuid(request.getOrganizationUuid());
        venue.setName(request.getName());
        venue.setDescription(request.getDescription());
        venue.setVenueType(request.getVenueType());
        venue.setAddressLine1(request.getAddressLine1());
        venue.setAddressLine2(request.getAddressLine2());
        venue.setCity(request.getCity());
        venue.setDistrict(request.getDistrict());
        venue.setState(request.getState());
        venue.setCountry(request.getCountry());
        venue.setPostalCode(request.getPostalCode());
        venue.setLatitude(request.getLatitude());
        venue.setLongitude(request.getLongitude());
        venue.setContactNumber(request.getContactNumber());
        venue.setEmail(request.getEmail());
        venue.setBookingEnabled(request.getBookingEnabled() != null ? request.getBookingEnabled() : true);
        venue.setStatus(request.getStatus() != null ? request.getStatus() : VenueStatus.ACTIVE);
        venue.setRulesAndRegulations(request.getRulesAndRegulations());
        venue.setCancellationPolicy(request.getCancellationPolicy());
        venue.setCreatedBy(performedByUserId);

        Venue saved = venueRepository.save(venue);

        // Save Operating Hours
        if (request.getOperatingHours() != null) {
            for (VenueCreateRequest.OperatingHourInput h : request.getOperatingHours()) {
                DayOfWeek dow = parseDayOfWeek(h.getDayOfWeek());
                VenueOperatingHour hour = new VenueOperatingHour(
                        saved.getVenueId(), dow, h.getOpeningTime(), h.getClosingTime(), h.getIsClosed()
                );
                operatingHourRepository.save(hour);
            }
        }

        // Save Amenities
        if (request.getAmenities() != null) {
            for (VenueCreateRequest.AmenityInput a : request.getAmenities()) {
                VenueAmenity amenity = new VenueAmenity(
                        saved.getVenueId(), a.getAmenityName(), a.getIconName(), a.getDescription()
                );
                amenityRepository.save(amenity);
            }
        }

        // Save Images
        if (request.getImages() != null) {
            for (VenueCreateRequest.ImageInput img : request.getImages()) {
                VenueImage image = new VenueImage(
                        saved.getVenueId(), img.getImageUrl(), img.getCaption(), img.getDisplayOrder(), img.getIsCover()
                );
                imageRepository.save(image);
            }
        }

        return getVenueByUuid(saved.getVenueUuid());
    }

    @Transactional
    public VenueDto updateVenue(UUID venueUuid, VenueCreateRequest request, Long performedByUserId) {
        Venue venue = venueRepository.findByVenueUuid(venueUuid)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with UUID: " + venueUuid));

        venue.setName(request.getName());
        venue.setDescription(request.getDescription());
        venue.setVenueType(request.getVenueType());
        venue.setAddressLine1(request.getAddressLine1());
        venue.setAddressLine2(request.getAddressLine2());
        venue.setCity(request.getCity());
        venue.setDistrict(request.getDistrict());
        venue.setState(request.getState());
        venue.setCountry(request.getCountry());
        venue.setPostalCode(request.getPostalCode());
        venue.setLatitude(request.getLatitude());
        venue.setLongitude(request.getLongitude());
        venue.setContactNumber(request.getContactNumber());
        venue.setEmail(request.getEmail());
        if (request.getBookingEnabled() != null) venue.setBookingEnabled(request.getBookingEnabled());
        if (request.getStatus() != null) venue.setStatus(request.getStatus());
        venue.setRulesAndRegulations(request.getRulesAndRegulations());
        venue.setCancellationPolicy(request.getCancellationPolicy());
        venue.setUpdatedBy(performedByUserId);

        venueRepository.save(venue);

        // Update Operating Hours if provided
        if (request.getOperatingHours() != null) {
            operatingHourRepository.deleteByVenueId(venue.getVenueId());
            for (VenueCreateRequest.OperatingHourInput h : request.getOperatingHours()) {
                DayOfWeek dow = parseDayOfWeek(h.getDayOfWeek());
                operatingHourRepository.save(new VenueOperatingHour(
                        venue.getVenueId(), dow, h.getOpeningTime(), h.getClosingTime(), h.getIsClosed()
                ));
            }
        }

        // Update Amenities if provided
        if (request.getAmenities() != null) {
            amenityRepository.deleteByVenueId(venue.getVenueId());
            for (VenueCreateRequest.AmenityInput a : request.getAmenities()) {
                amenityRepository.save(new VenueAmenity(
                        venue.getVenueId(), a.getAmenityName(), a.getIconName(), a.getDescription()
                ));
            }
        }

        // Update Images if provided
        if (request.getImages() != null) {
            imageRepository.deleteByVenueId(venue.getVenueId());
            for (VenueCreateRequest.ImageInput img : request.getImages()) {
                imageRepository.save(new VenueImage(
                        venue.getVenueId(), img.getImageUrl(), img.getCaption(), img.getDisplayOrder(), img.getIsCover()
                ));
            }
        }

        return getVenueByUuid(venue.getVenueUuid());
    }

    @Transactional(readOnly = true)
    public VenueDto getVenueByUuid(UUID venueUuid) {
        Venue venue = venueRepository.findByVenueUuid(venueUuid)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with UUID: " + venueUuid));
        return mapToDto(venue);
    }

    @Transactional(readOnly = true)
    public VenueDto getVenueById(Long venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + venueId));
        return mapToDto(venue);
    }

    @Transactional
    public List<VenueDto> getVenuesByOrganization(UUID orgUuid) {
        List<Venue> venues = venueRepository.findByOrganizationUuid(orgUuid);
        if (venues.isEmpty()) {
            organizationRepository.findByOrganizationUuid(orgUuid).ifPresent(org -> {
                Venue autoVenue = new Venue();
                autoVenue.setOrganizationId(org.getOrganizationId());
                autoVenue.setOrganizationUuid(org.getOrganizationUuid());
                autoVenue.setName(org.getName() != null && !org.getName().trim().isEmpty() ? org.getName() : "Main Arena");
                autoVenue.setDescription(org.getDescription() != null ? org.getDescription() : "Sports Complex & Venue");
                autoVenue.setVenueType(com.athlon.identityservice.venue.enums.VenueType.MIXED);
                autoVenue.setBookingEnabled(true);
                autoVenue.setStatus(VenueStatus.ACTIVE);
                autoVenue.setCreatedBy(org.getCreatedBy());
                venueRepository.save(autoVenue);
            });
            venues = venueRepository.findByOrganizationUuid(orgUuid);
        }
        return venues.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VenueDto> getPublicVenues(String city) {
        List<Venue> venues;
        if (city != null && !city.trim().isEmpty()) {
            venues = venueRepository.findByCityIgnoreCase(city);
        } else {
            venues = venueRepository.findByStatus(VenueStatus.ACTIVE);
        }
        return venues.stream()
                .filter(v -> v.getStatus() == VenueStatus.ACTIVE && Boolean.TRUE.equals(v.getBookingEnabled()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private DayOfWeek parseDayOfWeek(String dow) {
        if (dow == null || dow.trim().isEmpty()) return DayOfWeek.MONDAY;
        try {
            return DayOfWeek.valueOf(dow.toUpperCase().trim());
        } catch (Exception e) {
            return DayOfWeek.MONDAY;
        }
    }

    private VenueDto mapToDto(Venue v) {
        VenueDto dto = new VenueDto();
        dto.setVenueId(v.getVenueId());
        dto.setVenueUuid(v.getVenueUuid());
        dto.setOrganizationId(v.getOrganizationId());
        dto.setOrganizationUuid(v.getOrganizationUuid());
        dto.setName(v.getName());
        dto.setDescription(v.getDescription());
        dto.setVenueType(v.getVenueType());
        dto.setAddressLine1(v.getAddressLine1());
        dto.setAddressLine2(v.getAddressLine2());
        dto.setCity(v.getCity());
        dto.setDistrict(v.getDistrict());
        dto.setState(v.getState());
        dto.setCountry(v.getCountry());
        dto.setPostalCode(v.getPostalCode());
        dto.setLatitude(v.getLatitude());
        dto.setLongitude(v.getLongitude());
        dto.setContactNumber(v.getContactNumber());
        dto.setEmail(v.getEmail());
        dto.setOpeningStatus(v.getOpeningStatus());
        dto.setBookingEnabled(v.getBookingEnabled());
        dto.setStatus(v.getStatus());
        dto.setRulesAndRegulations(v.getRulesAndRegulations());
        dto.setCancellationPolicy(v.getCancellationPolicy());
        dto.setCreatedAt(v.getCreatedAt());
        dto.setUpdatedAt(v.getUpdatedAt());

        // Count facilities
        int totalFacs = facilityRepository.findByVenueId(v.getVenueId()).size();
        dto.setTotalFacilities(totalFacs);

        // Operating hours
        List<VenueOperatingHour> hours = operatingHourRepository.findByVenueId(v.getVenueId());
        dto.setOperatingHours(hours.stream().map(h -> new VenueDto.OperatingHourDto(
                h.getId(), h.getDayOfWeek() != null ? h.getDayOfWeek().name() : "MONDAY", h.getOpeningTime(), h.getClosingTime(), h.getIsClosed()
        )).collect(Collectors.toList()));

        // Amenities
        List<VenueAmenity> amenities = amenityRepository.findByVenueId(v.getVenueId());
        dto.setAmenities(amenities.stream().map(a -> new VenueDto.AmenityDto(
                a.getId(), a.getAmenityName(), a.getIconName(), a.getDescription()
        )).collect(Collectors.toList()));

        // Images
        List<VenueImage> images = imageRepository.findByVenueIdOrderByDisplayOrderAsc(v.getVenueId());
        dto.setImages(images.stream().map(img -> new VenueDto.ImageDto(
                img.getId(), img.getImageUrl(), img.getCaption(), img.getDisplayOrder(), img.getIsCover()
        )).collect(Collectors.toList()));

        return dto;
    }
}
