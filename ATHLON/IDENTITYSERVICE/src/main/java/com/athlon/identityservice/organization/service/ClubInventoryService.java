package com.athlon.identityservice.organization.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.dto.request.AdjustStockRequest;
import com.athlon.identityservice.organization.dto.request.CreateInventoryItemRequest;
import com.athlon.identityservice.organization.dto.request.UpdateInventoryItemRequest;
import com.athlon.identityservice.organization.dto.response.ClubInventoryItemResponse;
import com.athlon.identityservice.organization.dto.response.ClubInventoryLogResponse;
import com.athlon.identityservice.organization.dto.response.InventorySummaryResponse;
import com.athlon.identityservice.organization.entity.ClubInventoryItem;
import com.athlon.identityservice.organization.entity.ClubInventoryLog;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.ClubInventoryItemRepository;
import com.athlon.identityservice.organization.repository.ClubInventoryLogRepository;
import com.athlon.identityservice.organization.repository.OrganizationMemberRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.user.repository.UserProfileRepository;

@Service
public class ClubInventoryService {

    private final ClubInventoryItemRepository itemRepository;
    private final ClubInventoryLogRepository logRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserProfileRepository userProfileRepository;

    public ClubInventoryService(
            ClubInventoryItemRepository itemRepository,
            ClubInventoryLogRepository logRepository,
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository organizationMemberRepository,
            UserProfileRepository userProfileRepository) {
        this.itemRepository = itemRepository;
        this.logRepository = logRepository;
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional(readOnly = true)
    public List<ClubInventoryItemResponse> getItems(UUID organizationUuid, String category, String status) {
        List<ClubInventoryItem> list;

        boolean hasCategory = category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category);
        boolean hasStatus = status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status);

        if (hasCategory && hasStatus) {
            list = itemRepository.findByOrganizationUuidAndCategoryAndStatusOrderByCreatedAtDesc(organizationUuid, category.trim(), status.trim());
        } else if (hasCategory) {
            list = itemRepository.findByOrganizationUuidAndCategoryOrderByCreatedAtDesc(organizationUuid, category.trim());
        } else if (hasStatus) {
            list = itemRepository.findByOrganizationUuidAndStatusOrderByCreatedAtDesc(organizationUuid, status.trim());
        } else {
            list = itemRepository.findByOrganizationUuidOrderByCreatedAtDesc(organizationUuid);
        }

        return list.stream().map(this::mapToItemResponse).collect(Collectors.toList());
    }

    @Transactional
    public ClubInventoryItemResponse createItem(CreateInventoryItemRequest request, Long currentUserId) {
        Organization org = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        ClubInventoryItem item = new ClubInventoryItem();
        item.setOrganizationId(org.getOrganizationId());
        item.setOrganizationUuid(org.getOrganizationUuid());
        item.setItemName(request.getItemName().trim());
        item.setCategory(request.getCategory().trim());
        item.setQuantity(request.getQuantity() != null ? request.getQuantity() : 0);
        item.setMinThreshold(request.getMinThreshold() != null ? request.getMinThreshold() : 5);
        item.setUnit(request.getUnit() != null ? request.getUnit().trim() : "Units");
        item.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        item.setUnitCost(request.getUnitCost());
        item.setImageUrl(request.getImageUrl());
        item.setNotes(request.getNotes());
        item.setCreatedBy(currentUserId);
        item.setUpdatedBy(currentUserId);

        ClubInventoryItem saved = itemRepository.save(item);

        // Record initial stock log if quantity > 0
        if (saved.getQuantity() > 0) {
            ClubInventoryLog log = new ClubInventoryLog();
            log.setItemId(saved.getItemId());
            log.setItemUuid(saved.getItemUuid());
            log.setOrganizationId(saved.getOrganizationId());
            log.setOrganizationUuid(saved.getOrganizationUuid());
            log.setChangeType("RESTOCK");
            log.setQuantityChange(saved.getQuantity());
            log.setQuantityAfter(saved.getQuantity());
            log.setNotes("Initial stock addition");
            log.setLoggedBy(currentUserId);
            logRepository.save(log);
        }

        return mapToItemResponse(saved);
    }

    @Transactional
    public ClubInventoryItemResponse updateItem(UpdateInventoryItemRequest request, Long currentUserId) {
        ClubInventoryItem item = itemRepository.findByItemUuid(request.getItemUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found"));

        if (request.getItemName() != null && !request.getItemName().trim().isEmpty()) {
            item.setItemName(request.getItemName().trim());
        }
        if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
            item.setCategory(request.getCategory().trim());
        }
        if (request.getMinThreshold() != null) {
            item.setMinThreshold(request.getMinThreshold());
        }
        if (request.getUnit() != null) {
            item.setUnit(request.getUnit().trim());
        }
        if (request.getLocation() != null) {
            item.setLocation(request.getLocation().trim());
        }
        if (request.getUnitCost() != null) {
            item.setUnitCost(request.getUnitCost());
        }
        if (request.getImageUrl() != null) {
            item.setImageUrl(request.getImageUrl());
        }
        if (request.getNotes() != null) {
            item.setNotes(request.getNotes());
        }
        if (request.getQuantity() != null && !request.getQuantity().equals(item.getQuantity())) {
            int oldQty = item.getQuantity();
            int newQty = request.getQuantity();
            int diff = newQty - oldQty;

            item.setQuantity(newQty);

            // Record adjustment log
            ClubInventoryLog log = new ClubInventoryLog();
            log.setItemId(item.getItemId());
            log.setItemUuid(item.getItemUuid());
            log.setOrganizationId(item.getOrganizationId());
            log.setOrganizationUuid(item.getOrganizationUuid());
            log.setChangeType(diff > 0 ? "RESTOCK" : "ADJUSTMENT");
            log.setQuantityChange(diff);
            log.setQuantityAfter(newQty);
            log.setNotes("Manual stock count update");
            log.setLoggedBy(currentUserId);
            logRepository.save(log);
        }

        item.setUpdatedBy(currentUserId);
        ClubInventoryItem saved = itemRepository.save(item);
        return mapToItemResponse(saved);
    }

    @Transactional
    public ClubInventoryItemResponse adjustStock(AdjustStockRequest request, Long currentUserId) {
        ClubInventoryItem item = itemRepository.findByItemUuid(request.getItemUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found"));

        int currentQty = item.getQuantity() != null ? item.getQuantity() : 0;
        int change = request.getQuantityChange() != null ? request.getQuantityChange() : 0;
        int newQty = Math.max(0, currentQty + change);

        item.setQuantity(newQty);
        item.setUpdatedBy(currentUserId);
        ClubInventoryItem saved = itemRepository.save(item);

        // Record stock log
        ClubInventoryLog log = new ClubInventoryLog();
        log.setItemId(saved.getItemId());
        log.setItemUuid(saved.getItemUuid());
        log.setOrganizationId(saved.getOrganizationId());
        log.setOrganizationUuid(saved.getOrganizationUuid());
        log.setChangeType(request.getChangeType() != null ? request.getChangeType().toUpperCase() : (change >= 0 ? "RESTOCK" : "CONSUMED"));
        log.setQuantityChange(change);
        log.setQuantityAfter(newQty);
        log.setMemberUuid(request.getMemberUuid());
        log.setNotes(request.getNotes());
        log.setLoggedBy(currentUserId);
        logRepository.save(log);

        return mapToItemResponse(saved);
    }

    @Transactional
    public void deleteItem(UUID itemUuid) {
        ClubInventoryItem item = itemRepository.findByItemUuid(itemUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found"));
        itemRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public List<ClubInventoryLogResponse> getLogs(UUID organizationUuid, UUID itemUuid) {
        List<ClubInventoryLog> list;
        if (itemUuid != null) {
            list = logRepository.findByItemUuidOrderByCreatedAtDesc(itemUuid);
        } else {
            list = logRepository.findByOrganizationUuidOrderByCreatedAtDesc(organizationUuid);
        }

        return list.stream().map(this::mapToLogResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InventorySummaryResponse getSummary(UUID organizationUuid) {
        List<ClubInventoryItem> items = itemRepository.findByOrganizationUuidOrderByCreatedAtDesc(organizationUuid);

        int totalCategories = items.size();
        int totalQuantity = 0;
        int inStockCount = 0;
        int lowStockCount = 0;
        int outOfStockCount = 0;
        BigDecimal estimatedTotalValue = BigDecimal.ZERO;
        Map<String, Integer> quantityByCategory = new HashMap<>();

        for (ClubInventoryItem item : items) {
            int qty = item.getQuantity() != null ? item.getQuantity() : 0;
            totalQuantity += qty;

            String status = item.getStatus();
            if ("OUT_OF_STOCK".equalsIgnoreCase(status) || qty <= 0) {
                outOfStockCount++;
            } else if ("LOW_STOCK".equalsIgnoreCase(status)) {
                lowStockCount++;
            } else {
                inStockCount++;
            }

            if (item.getUnitCost() != null && qty > 0) {
                BigDecimal itemVal = item.getUnitCost().multiply(BigDecimal.valueOf(qty));
                estimatedTotalValue = estimatedTotalValue.add(itemVal);
            }

            String cat = item.getCategory() != null ? item.getCategory() : "OTHER";
            quantityByCategory.put(cat, quantityByCategory.getOrDefault(cat, 0) + qty);
        }

        InventorySummaryResponse summary = new InventorySummaryResponse();
        summary.setTotalCategories(totalCategories);
        summary.setTotalQuantity(totalQuantity);
        summary.setInStockCount(inStockCount);
        summary.setLowStockCount(lowStockCount);
        summary.setOutOfStockCount(outOfStockCount);
        summary.setEstimatedTotalValue(estimatedTotalValue);
        summary.setQuantityByCategory(quantityByCategory);

        return summary;
    }

    private ClubInventoryItemResponse mapToItemResponse(ClubInventoryItem item) {
        ClubInventoryItemResponse resp = new ClubInventoryItemResponse();
        resp.setItemId(item.getItemId());
        resp.setItemUuid(item.getItemUuid());
        resp.setOrganizationId(item.getOrganizationId());
        resp.setOrganizationUuid(item.getOrganizationUuid());
        resp.setItemName(item.getItemName());
        resp.setCategory(item.getCategory());
        resp.setQuantity(item.getQuantity());
        resp.setMinThreshold(item.getMinThreshold());
        resp.setUnit(item.getUnit());
        resp.setLocation(item.getLocation());
        resp.setUnitCost(item.getUnitCost());
        resp.setStatus(item.getStatus());
        resp.setImageUrl(item.getImageUrl());
        resp.setNotes(item.getNotes());
        resp.setCreatedBy(item.getCreatedBy());
        resp.setCreatedAt(item.getCreatedAt());
        resp.setUpdatedAt(item.getUpdatedAt());
        return resp;
    }

    private ClubInventoryLogResponse mapToLogResponse(ClubInventoryLog log) {
        ClubInventoryLogResponse resp = new ClubInventoryLogResponse();
        resp.setLogId(log.getLogId());
        resp.setLogUuid(log.getLogUuid());
        resp.setItemId(log.getItemId());
        resp.setItemUuid(log.getItemUuid());
        resp.setOrganizationId(log.getOrganizationId());
        resp.setOrganizationUuid(log.getOrganizationUuid());
        resp.setChangeType(log.getChangeType());
        resp.setQuantityChange(log.getQuantityChange());
        resp.setQuantityAfter(log.getQuantityAfter());
        resp.setMemberUuid(log.getMemberUuid());
        resp.setNotes(log.getNotes());
        resp.setLoggedBy(log.getLoggedBy());
        resp.setCreatedAt(log.getCreatedAt());

        // Item metadata
        if (log.getItemUuid() != null) {
            itemRepository.findByItemUuid(log.getItemUuid()).ifPresent(item -> {
                resp.setItemName(item.getItemName());
                resp.setItemCategory(item.getCategory());
            });
        }

        // Member name
        if (log.getMemberUuid() != null) {
            try {
                organizationMemberRepository.findByOrganizationMemberUuid(log.getMemberUuid()).ifPresent(m -> {
                    if (m.getUserId() != null) {
                        userProfileRepository.findByUserId(m.getUserId()).ifPresent(p -> {
                            String fullName = ((p.getFirstName() != null ? p.getFirstName() : "") + " " + (p.getLastName() != null ? p.getLastName() : "")).trim();
                            resp.setMemberName(fullName.isEmpty() ? "Member" : fullName);
                        });
                    }
                });
            } catch (Exception ignored) {
            }
        }

        return resp;
    }
}
