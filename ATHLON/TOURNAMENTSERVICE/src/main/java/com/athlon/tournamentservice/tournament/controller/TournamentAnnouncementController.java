package com.athlon.tournamentservice.tournament.controller;

import com.athlon.tournamentservice.dto.request.TournamentAnnouncementCreateRequest;
import com.athlon.tournamentservice.dto.request.TournamentAnnouncementUpdateRequest;
import com.athlon.tournamentservice.dto.response.ApiResponse;
import com.athlon.tournamentservice.dto.response.TournamentAnnouncementResponse;
import com.athlon.tournamentservice.tournament.service.TournamentAnnouncementService;
import com.athlon.tournamentservice.util.DocumentUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tournament/announcements")
public class TournamentAnnouncementController {

    private final TournamentAnnouncementService announcementService;
    private final DocumentUtil documentUtil;

    public TournamentAnnouncementController(TournamentAnnouncementService announcementService, DocumentUtil documentUtil) {
        this.announcementService = announcementService;
        this.documentUtil = documentUtil;
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<TournamentAnnouncementResponse>> createAnnouncement(
            @Valid @ModelAttribute TournamentAnnouncementCreateRequest request,
            @RequestParam(value = "poster", required = false) MultipartFile poster,
            @RequestParam(value = "upiQr", required = false) MultipartFile upiQr) throws IOException {

        TournamentAnnouncementResponse response = announcementService.createAnnouncement(request, poster, upiQr);
        return new ResponseEntity<>(ApiResponse.success("Tournament announcement created successfully", response), HttpStatus.CREATED);
    }

    @PostMapping(value = "/update/{uuid}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<TournamentAnnouncementResponse>> updateAnnouncement(
            @PathVariable("uuid") UUID uuid,
            @ModelAttribute TournamentAnnouncementUpdateRequest request,
            @RequestParam(value = "poster", required = false) MultipartFile poster,
            @RequestParam(value = "upiQr", required = false) MultipartFile upiQr) throws IOException {

        TournamentAnnouncementResponse response = announcementService.updateAnnouncement(uuid, request, poster, upiQr);
        return ResponseEntity.ok(ApiResponse.success("Tournament announcement updated successfully", response));
    }

    @GetMapping("/public/all")
    public ResponseEntity<ApiResponse<List<TournamentAnnouncementResponse>>> getAllActiveAnnouncements(
            @RequestParam(value = "sport", required = false) String sport,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "matchFormat", required = false) String matchFormat,
            @RequestParam(value = "category", required = false) String category) {

        List<TournamentAnnouncementResponse> list = announcementService.getAllActiveAnnouncements(sport, city, matchFormat, category);
        return ResponseEntity.ok(ApiResponse.success("Active tournament announcements retrieved", list));
    }

    @GetMapping("/getByUuid/{uuid}")
    public ResponseEntity<ApiResponse<TournamentAnnouncementResponse>> getAnnouncementByUuid(
            @PathVariable("uuid") UUID uuid) {

        TournamentAnnouncementResponse response = announcementService.getAnnouncementByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.success("Tournament announcement retrieved", response));
    }

    @GetMapping("/my-announcements/{userUuid}")
    public ResponseEntity<ApiResponse<List<TournamentAnnouncementResponse>>> getMyAnnouncements(
            @PathVariable("userUuid") UUID userUuid) {

        List<TournamentAnnouncementResponse> list = announcementService.getMyAnnouncements(userUuid);
        return ResponseEntity.ok(ApiResponse.success("User tournament announcements retrieved", list));
    }

    @PostMapping("/status/{uuid}")
    public ResponseEntity<ApiResponse<TournamentAnnouncementResponse>> updateRegistrationStatus(
            @PathVariable("uuid") UUID uuid,
            @RequestParam("status") String status,
            @RequestParam("userUuid") UUID userUuid) {

        TournamentAnnouncementResponse response = announcementService.updateRegistrationStatus(uuid, status, userUuid);
        String msg = "OPEN".equalsIgnoreCase(response.getStatus()) ? "Registrations reopened" : "Registrations closed";
        return ResponseEntity.ok(ApiResponse.success(msg, response));
    }

    @PostMapping("/deactivate/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deactivateAnnouncement(
            @PathVariable("uuid") UUID uuid) {

        announcementService.deactivateAnnouncement(uuid);
        return ResponseEntity.ok(ApiResponse.success("Tournament announcement deactivated successfully", null));
    }

    @GetMapping("/getFile")
    public ResponseEntity<byte[]> getFile(@RequestParam("filePath") String filePath) {
        return documentUtil.getFile(filePath);
    }
}
