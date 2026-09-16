package com.athlon.identityservice.organization.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.organization.dto.request.AdjustOrganizerStockRequest;
import com.athlon.identityservice.organization.dto.request.CreateOrganizerInventoryRequest;
import com.athlon.identityservice.organization.dto.request.UpdateOrganizerInventoryRequest;
import com.athlon.identityservice.organization.dto.response.OrganizerInventoryItemResponse;
import com.athlon.identityservice.organization.dto.response.OrganizerInventoryLogResponse;
import com.athlon.identityservice.organization.dto.response.OrganizerInventorySummaryResponse;
import com.athlon.identityservice.organization.service.OrganizerInventoryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/organizer/inventory")
public class OrganizerInventoryController {

    private final OrganizerInventoryService inventoryService;

    public OrganizerInventoryController(OrganizerInventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<OrganizerInventoryItemResponse>>> getItems(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "tournamentUuid", required = false) UUID tournamentUuid) {

        List<OrganizerInventoryItemResponse> list = inventoryService.getItems(organizationUuid, category, status, tournamentUuid);
        return ResponseEntity.ok(ApiResponse.success("Organizer tournament inventory items retrieved successfully", list));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<OrganizerInventoryItemResponse>> createItem(
            @Valid @RequestBody CreateOrganizerInventoryRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        OrganizerInventoryItemResponse response = inventoryService.createItem(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Organizer inventory item created successfully", response));
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<OrganizerInventoryItemResponse>> updateItem(
            @Valid @RequestBody UpdateOrganizerInventoryRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        OrganizerInventoryItemResponse response = inventoryService.updateItem(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Organizer inventory item updated successfully", response));
    }

    @PostMapping("/stock/adjust")
    public ResponseEntity<ApiResponse<OrganizerInventoryItemResponse>> adjustStock(
            @Valid @RequestBody AdjustOrganizerStockRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        OrganizerInventoryItemResponse response = inventoryService.adjustStock(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Stock adjusted successfully", response));
    }

    @PostMapping("/delete/{itemUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @PathVariable("itemUuid") UUID itemUuid) {

        inventoryService.deleteItem(itemUuid);
        return ResponseEntity.ok(ApiResponse.success("Organizer inventory item deleted successfully", null));
    }

    @GetMapping("/logs/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<OrganizerInventoryLogResponse>>> getLogs(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "itemUuid", required = false) UUID itemUuid,
            @RequestParam(value = "tournamentUuid", required = false) UUID tournamentUuid) {

        List<OrganizerInventoryLogResponse> logs = inventoryService.getLogs(organizationUuid, itemUuid, tournamentUuid);
        return ResponseEntity.ok(ApiResponse.success("Organizer inventory logs retrieved successfully", logs));
    }

    @GetMapping("/summary/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<OrganizerInventorySummaryResponse>> getSummary(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "tournamentUuid", required = false) UUID tournamentUuid) {

        OrganizerInventorySummaryResponse summary = inventoryService.getSummary(organizationUuid, tournamentUuid);
        return ResponseEntity.ok(ApiResponse.success("Organizer inventory summary retrieved successfully", summary));
    }
}
