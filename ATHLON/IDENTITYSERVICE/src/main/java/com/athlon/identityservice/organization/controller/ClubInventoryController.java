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
import com.athlon.identityservice.organization.dto.request.AdjustStockRequest;
import com.athlon.identityservice.organization.dto.request.CreateInventoryItemRequest;
import com.athlon.identityservice.organization.dto.request.UpdateInventoryItemRequest;
import com.athlon.identityservice.organization.dto.response.ClubInventoryItemResponse;
import com.athlon.identityservice.organization.dto.response.ClubInventoryLogResponse;
import com.athlon.identityservice.organization.dto.response.InventorySummaryResponse;
import com.athlon.identityservice.organization.service.ClubInventoryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/club/inventory")
public class ClubInventoryController {

    private final ClubInventoryService inventoryService;

    public ClubInventoryController(ClubInventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<ClubInventoryItemResponse>>> getItems(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "status", required = false) String status) {

        List<ClubInventoryItemResponse> list = inventoryService.getItems(organizationUuid, category, status);
        return ResponseEntity.ok(ApiResponse.success("Inventory items retrieved successfully", list));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<ClubInventoryItemResponse>> createItem(
            @Valid @RequestBody CreateInventoryItemRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        ClubInventoryItemResponse response = inventoryService.createItem(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Inventory item created successfully", response));
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<ClubInventoryItemResponse>> updateItem(
            @Valid @RequestBody UpdateInventoryItemRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        ClubInventoryItemResponse response = inventoryService.updateItem(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Inventory item updated successfully", response));
    }

    @PostMapping("/stock/adjust")
    public ResponseEntity<ApiResponse<ClubInventoryItemResponse>> adjustStock(
            @Valid @RequestBody AdjustStockRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        ClubInventoryItemResponse response = inventoryService.adjustStock(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Stock adjusted successfully", response));
    }

    @PostMapping("/delete/{itemUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @PathVariable("itemUuid") UUID itemUuid) {

        inventoryService.deleteItem(itemUuid);
        return ResponseEntity.ok(ApiResponse.success("Inventory item deleted successfully", null));
    }

    @GetMapping("/logs/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<ClubInventoryLogResponse>>> getLogs(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "itemUuid", required = false) UUID itemUuid) {

        List<ClubInventoryLogResponse> logs = inventoryService.getLogs(organizationUuid, itemUuid);
        return ResponseEntity.ok(ApiResponse.success("Inventory logs retrieved successfully", logs));
    }

    @GetMapping("/summary/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<InventorySummaryResponse>> getSummary(
            @PathVariable("organizationUuid") UUID organizationUuid) {

        InventorySummaryResponse summary = inventoryService.getSummary(organizationUuid);
        return ResponseEntity.ok(ApiResponse.success("Inventory summary retrieved successfully", summary));
    }
}
