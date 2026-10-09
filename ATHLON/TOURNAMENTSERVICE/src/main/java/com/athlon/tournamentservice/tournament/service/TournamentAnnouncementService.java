package com.athlon.tournamentservice.tournament.service;

import com.athlon.tournamentservice.dto.request.TournamentAnnouncementCreateRequest;
import com.athlon.tournamentservice.dto.request.TournamentAnnouncementUpdateRequest;
import com.athlon.tournamentservice.dto.response.TournamentAnnouncementResponse;
import com.athlon.tournamentservice.exception.ResourceNotFoundException;
import com.athlon.tournamentservice.tournament.entity.TournamentAnnouncement;
import com.athlon.tournamentservice.tournament.repository.TournamentAnnouncementRepository;
import com.athlon.tournamentservice.util.FileStorageUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TournamentAnnouncementService {

    private final TournamentAnnouncementRepository announcementRepository;
    private final FileStorageUtil fileStorageUtil;

    @Value("${athlon.tournament.poster.upload.directory}")
    private String posterUploadDir;

    public TournamentAnnouncementService(TournamentAnnouncementRepository announcementRepository, FileStorageUtil fileStorageUtil) {
        this.announcementRepository = announcementRepository;
        this.fileStorageUtil = fileStorageUtil;
    }

    @Transactional
    public TournamentAnnouncementResponse createAnnouncement(TournamentAnnouncementCreateRequest request,
                                                             MultipartFile poster,
                                                             MultipartFile upiQr) throws IOException {
        TournamentAnnouncement announcement = new TournamentAnnouncement();
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        announcement.setSport(request.getSport() != null && !request.getSport().isBlank() ? request.getSport() : "General");
        announcement.setMatchFormat(request.getMatchFormat());
        announcement.setCategory(request.getCategory());
        if (request.getCategoryDetails() != null && !request.getCategoryDetails().isBlank()) {
            announcement.setCategoryDetails(request.getCategoryDetails());
        } else if (request.getMatchFormat() != null || request.getCategory() != null) {
            String combined = java.util.stream.Stream.of(request.getMatchFormat(), request.getCategory())
                    .filter(s -> s != null && !s.isBlank())
                    .collect(java.util.stream.Collectors.joining(" • "));
            announcement.setCategoryDetails(combined.isBlank() ? null : combined);
        }
        announcement.setStartDate(request.getStartDate());
        announcement.setEndDate(request.getEndDate());
        announcement.setRegistrationDeadline(request.getRegistrationDeadline());
        announcement.setVenueName(request.getVenueName());
        announcement.setCity(request.getCity());
        announcement.setDistrict(request.getDistrict());
        announcement.setState(request.getState());
        announcement.setAddress(request.getAddress());
        announcement.setLocationMapUrl(request.getLocationMapUrl());
        announcement.setEntryFee(request.getEntryFee());
        announcement.setPrizePool(request.getPrizePool());
        announcement.setOrganizerName(request.getOrganizerName());
        announcement.setContactPhone(request.getContactPhone());
        announcement.setContactEmail(request.getContactEmail());
        announcement.setWhatsappNumber(request.getWhatsappNumber());
        announcement.setExternalRegistrationUrl(request.getExternalRegistrationUrl());
        announcement.setUserUuid(request.getUserUuid());
        announcement.setCreatedBy(request.getCreatedBy());
        announcement.setStatus("OPEN");
        announcement.setActive(true);

        if (poster != null && !poster.isEmpty()) {
            String fileName = fileStorageUtil.saveFileToDir(poster, posterUploadDir, "");
            announcement.setPosterUrl("/" + posterUploadDir + "/" + fileName);
        }

        if (upiQr != null && !upiQr.isEmpty()) {
            String qrFileName = fileStorageUtil.saveFileToDir(upiQr, posterUploadDir, "");
            announcement.setUpiQrCodeUrl("/" + posterUploadDir + "/" + qrFileName);
        }

        TournamentAnnouncement saved = announcementRepository.save(announcement);
        return TournamentAnnouncementResponse.fromEntity(saved);
    }

    @Transactional
    public TournamentAnnouncementResponse updateAnnouncement(UUID uuid,
                                                             TournamentAnnouncementUpdateRequest request,
                                                             MultipartFile poster,
                                                             MultipartFile upiQr) throws IOException {
        TournamentAnnouncement announcement = announcementRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with uuid: " + uuid));

        if (request.getTitle() != null) announcement.setTitle(request.getTitle());
        if (request.getContent() != null) announcement.setContent(request.getContent());
        if (request.getSport() != null) announcement.setSport(request.getSport());
        if (request.getMatchFormat() != null) announcement.setMatchFormat(request.getMatchFormat());
        if (request.getCategory() != null) announcement.setCategory(request.getCategory());
        if (request.getCategoryDetails() != null) announcement.setCategoryDetails(request.getCategoryDetails());
        if (request.getStartDate() != null) announcement.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) announcement.setEndDate(request.getEndDate());
        if (request.getRegistrationDeadline() != null) announcement.setRegistrationDeadline(request.getRegistrationDeadline());
        if (request.getVenueName() != null) announcement.setVenueName(request.getVenueName());
        if (request.getCity() != null) announcement.setCity(request.getCity());
        if (request.getDistrict() != null) announcement.setDistrict(request.getDistrict());
        if (request.getState() != null) announcement.setState(request.getState());
        if (request.getAddress() != null) announcement.setAddress(request.getAddress());
        if (request.getLocationMapUrl() != null) announcement.setLocationMapUrl(request.getLocationMapUrl());
        if (request.getEntryFee() != null) announcement.setEntryFee(request.getEntryFee());
        if (request.getPrizePool() != null) announcement.setPrizePool(request.getPrizePool());
        if (request.getOrganizerName() != null) announcement.setOrganizerName(request.getOrganizerName());
        if (request.getContactPhone() != null) announcement.setContactPhone(request.getContactPhone());
        if (request.getContactEmail() != null) announcement.setContactEmail(request.getContactEmail());
        if (request.getWhatsappNumber() != null) announcement.setWhatsappNumber(request.getWhatsappNumber());
        if (request.getExternalRegistrationUrl() != null) announcement.setExternalRegistrationUrl(request.getExternalRegistrationUrl());
        if (request.getStatus() != null) announcement.setStatus(request.getStatus());
        if (request.getUpdatedBy() != null) announcement.setUpdatedBy(request.getUpdatedBy());

        if (poster != null && !poster.isEmpty()) {
            String fileName = fileStorageUtil.saveFileToDir(poster, posterUploadDir, "");
            announcement.setPosterUrl("/" + posterUploadDir + "/" + fileName);
        }

        if (upiQr != null && !upiQr.isEmpty()) {
            String qrFileName = fileStorageUtil.saveFileToDir(upiQr, posterUploadDir, "");
            announcement.setUpiQrCodeUrl("/" + posterUploadDir + "/" + qrFileName);
        }

        TournamentAnnouncement updated = announcementRepository.save(announcement);
        return TournamentAnnouncementResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public TournamentAnnouncementResponse getAnnouncementByUuid(UUID uuid) {
        TournamentAnnouncement announcement = announcementRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with uuid: " + uuid));
        return TournamentAnnouncementResponse.fromEntity(announcement);
    }

    @Transactional(readOnly = true)
    public List<TournamentAnnouncementResponse> getAllActiveAnnouncements(String sport, String city, String matchFormat, String category) {
        String sportFilter = (sport != null && !sport.isBlank() && !"all".equalsIgnoreCase(sport)) ? sport.trim() : null;
        String cityFilter = (city != null && !city.isBlank()) ? city.trim() : null;
        String formatFilter = (matchFormat != null && !matchFormat.isBlank()) ? matchFormat.trim() : null;
        String categoryFilter = (category != null && !category.isBlank()) ? category.trim() : null;

        List<TournamentAnnouncement> list;
        if (sportFilter != null && cityFilter != null) {
            list = announcementRepository.findBySportIgnoreCaseAndCityContainingIgnoreCaseAndIsActiveTrueOrderByCreatedAtDesc(sportFilter, cityFilter);
        } else if (sportFilter != null) {
            list = announcementRepository.findBySportIgnoreCaseAndIsActiveTrueOrderByCreatedAtDesc(sportFilter);
        } else if (cityFilter != null) {
            list = announcementRepository.findByCityContainingIgnoreCaseAndIsActiveTrueOrderByCreatedAtDesc(cityFilter);
        } else {
            list = announcementRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        }

        return list.stream()
                .filter(a -> formatFilter == null || (a.getMatchFormat() != null && a.getMatchFormat().equalsIgnoreCase(formatFilter)))
                .filter(a -> categoryFilter == null || (a.getCategory() != null && a.getCategory().toLowerCase().contains(categoryFilter.toLowerCase())))
                .map(TournamentAnnouncementResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TournamentAnnouncementResponse> getAllActiveAnnouncements(String sport, String city) {
        return getAllActiveAnnouncements(sport, city, null, null);
    }

    @Transactional(readOnly = true)
    public List<TournamentAnnouncementResponse> getMyAnnouncements(UUID userUuid) {
        if (userUuid == null) {
            return List.of();
        }
        List<TournamentAnnouncement> list = announcementRepository.findByUserUuidAndIsActiveTrueOrderByCreatedAtDesc(userUuid);
        return list.stream().map(TournamentAnnouncementResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public TournamentAnnouncementResponse updateRegistrationStatus(UUID uuid, String status, UUID userUuid) {
        if (status == null || status.isBlank()) {
            throw new com.athlon.tournamentservice.exception.BadRequestException("Status is required");
        }
        String normalized = status.trim().toUpperCase();
        if (!"OPEN".equals(normalized) && !"CLOSED".equals(normalized)) {
            throw new com.athlon.tournamentservice.exception.BadRequestException("Status must be OPEN or CLOSED");
        }
        TournamentAnnouncement announcement = announcementRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with uuid: " + uuid));
        if (userUuid == null || announcement.getUserUuid() == null || !announcement.getUserUuid().equals(userUuid)) {
            throw new com.athlon.tournamentservice.exception.BadRequestException("Only the creator of this announcement can change its status");
        }
        if (!announcement.isActive()) {
            throw new com.athlon.tournamentservice.exception.BadRequestException("This announcement has been removed");
        }
        announcement.setStatus(normalized);
        TournamentAnnouncement saved = announcementRepository.save(announcement);
        return TournamentAnnouncementResponse.fromEntity(saved);
    }

    @Transactional
    public void deactivateAnnouncement(UUID uuid) {
        TournamentAnnouncement announcement = announcementRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with uuid: " + uuid));
        announcement.setActive(false);
        announcement.setStatus("CLOSED");
        announcementRepository.save(announcement);
    }
}
