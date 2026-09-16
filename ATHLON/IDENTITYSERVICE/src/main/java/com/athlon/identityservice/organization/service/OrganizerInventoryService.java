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
import com.athlon.identityservice.organization.dto.request.AdjustOrganizerStockRequest;
import com.athlon.identityservice.organization.dto.request.CreateOrganizerInventoryRequest;
import com.athlon.identityservice.organization.dto.request.UpdateOrganizerInventoryRequest;
import com.athlon.identityservice.organization.dto.response.OrganizerInventoryItemResponse;
import com.athlon.identityservice.organization.dto.response.OrganizerInventoryLogResponse;
import com.athlon.identityservice.organization.dto.response.OrganizerInventorySummaryResponse;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.entity.OrganizerInventoryItem;
import com.athlon.identityservice.organization.entity.OrganizerInventoryLog;
import com.athlon.identityservice.organization.repository.OrganizationMemberRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.organization.repository.OrganizerInventoryItemRepository;
import com.athlon.identityservice.organization.repository.OrganizerInventoryLogRepository;
import com.athlon.identityservice.user.repository.UserProfileRepository;

@Service
public class OrganizerInventoryService {

    private final OrganizerInventoryItemRepository itemRepository;
    private final OrganizerInventoryLogRepository logRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserProfileRepository userProfileRepository;

    public OrganizerInventoryService(
            OrganizerInventoryItemRepository itemRepository,
            OrganizerInventoryLogRepository logRepository,
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
    public List<OrganizerInventoryItemResponse> getItems(UUID organizationUuid, String category, String status, UUID tournamentUuid) {
        List<OrganizerInventoryItem> list;

        boolean hasCategory = category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category);
        boolean hasStatus = status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status);

        if (tournamentUuid != null) {
            list = itemRepository.findByOrganizationUuidAndTournamentUuidOrderByCreatedAtDesc(organizationUuid, tournamentUuid);
            if (hasCategory) {
                list = list.stream().filter(i -> category.trim().equalsIgnoreCase(i.getCategory())).collect(Collectors.toList());
            }
            if (hasStatus) {
                list = list.stream().filter(i -> status.trim().equalsIgnoreCase(i.getStatus())).collect(Collectors.toList());
            }
        } else if (hasCategory && hasStatus) {
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
    public OrganizerInventoryItemResponse createItem(CreateOrganizerInventoryRequest request, Long currentUserId) {
        Organization org = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        OrganizerInventoryItem item = new OrganizerInventoryItem();
        item.setOrganizationId(org.getOrganizationId());
        item.setOrganizationUuid(org.getOrganizationUuid());
        item.setTournamentUuid(request.getTournamentUuid());
        item.setItemName(request.getItemName().trim());
        item.setCategory(request.getCategory().trim());
        item.setQuantity(request.getQuantity() != null ? request.getQuantity() : 0);
        item.setMinThreshold(request.getMinThreshold() != null ? request.getMinThreshold() : 5);
        item.setUnit(request.getUnit() != null ? request.getUnit().trim() : "Units");
        item.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        item.setUnitCost(request.getUnitCost());
        item.setConditionStatus(request.getConditionStatus() != null ? request.getConditionStatus().trim() : "NEW");
        item.setIsRental(request.getIsRental() != null ? request.getIsRental() : false);
        item.setReturnDueDate(request.getReturnDueDate());
        item.setImageUrl(request.getImageUrl());
        item.setNotes(request.getNotes());
        item.setCreatedBy(currentUserId);
        item.setUpdatedBy(currentUserId);

        OrganizerInventoryItem saved = itemRepository.save(item);

        // Record initial stock log if quantity > 0
        if (saved.getQuantity() > 0) {
            OrganizerInventoryLog log = new OrganizerInventoryLog();
            log.setItemId(saved.getItemId());
            log.setItemUuid(saved.getItemUuid());
            log.setOrganizationId(saved.getOrganizationId());
            log.setOrganizationUuid(saved.getOrganizationUuid());
            log.setTournamentUuid(saved.getTournamentUuid());
            log.setChangeType("RESTOCK");
            log.setQuantityChange(saved.getQuantity());
            log.setQuantityAfter(saved.getQuantity());
            log.setNotes("Initial tournament inventory addition");
            log.setLoggedByName(fetchUserName(currentUserId));
            logRepository.save(log);
        }

        return mapToItemResponse(saved);
    }

    @Transactional
    public OrganizerInventoryItemResponse updateItem(UpdateOrganizerInventoryRequest request, Long currentUserId) {
        OrganizerInventoryItem item = itemRepository.findByItemUuid(request.getItemUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found"));

        if (request.getItemName() != null && !request.getItemName().trim().isEmpty()) {
            item.setItemName(request.getItemName().trim());
        }
        if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
            item.setCategory(request.getCategory().trim());
        }
        if (request.getTournamentUuid() != null) {
            item.setTournamentUuid(request.getTournamentUuid());
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
        if (request.getConditionStatus() != null) {
            item.setConditionStatus(request.getConditionStatus().trim());
        }
        if (request.getIsRental() != null) {
            item.setIsRental(request.getIsRental());
        }
        if (request.getReturnDueDate() != null) {
            item.setReturnDueDate(request.getReturnDueDate());
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
            OrganizerInventoryLog log = new OrganizerInventoryLog();
            log.setItemId(item.getItemId());
            log.setItemUuid(item.getItemUuid());
            log.setOrganizationId(item.getOrganizationId());
            log.setOrganizationUuid(item.getOrganizationUuid());
            log.setTournamentUuid(item.getTournamentUuid());
            log.setChangeType(diff > 0 ? "RESTOCK" : "ADJUSTMENT");
            log.setQuantityChange(diff);
            log.setQuantityAfter(newQty);
            log.setNotes("Manual stock count update");
            log.setLoggedByName(fetchUserName(currentUserId));
            logRepository.save(log);
        }

        item.setUpdatedBy(currentUserId);
        OrganizerInventoryItem saved = itemRepository.save(item);
        return mapToItemResponse(saved);
    }

    @Transactional
    public OrganizerInventoryItemResponse adjustStock(AdjustOrganizerStockRequest request, Long currentUserId) {
        OrganizerInventoryItem item = itemRepository.findByItemUuid(request.getItemUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found"));

        int currentQty = item.getQuantity() != null ? item.getQuantity() : 0;
        int change = request.getQuantityChange() != null ? request.getQuantityChange() : 0;
        int newQty = Math.max(0, currentQty + change);

        item.setQuantity(newQty);
        item.setUpdatedBy(currentUserId);
        OrganizerInventoryItem saved = itemRepository.save(item);

        // Record stock log
        OrganizerInventoryLog log = new OrganizerInventoryLog();
        log.setItemId(saved.getItemId());
        log.setItemUuid(saved.getItemUuid());
        log.setOrganizationId(saved.getOrganizationId());
        log.setOrganizationUuid(saved.getOrganizationUuid());
        log.setTournamentUuid(request.getTournamentUuid() != null ? request.getTournamentUuid() : saved.getTournamentUuid());
        log.setChangeType(request.getChangeType() != null ? request.getChangeType().toUpperCase() : (change >= 0 ? "RESTOCK" : "CONSUMED_MATCH"));
        log.setQuantityChange(change);
        log.setQuantityAfter(newQty);
        log.setCourtNumber(request.getCourtNumber());
        log.setRecipientName(request.getRecipientName());
        log.setMemberUuid(request.getMemberUuid());
        log.setNotes(request.getNotes());
        log.setLoggedByName(fetchUserName(currentUserId));
        logRepository.save(log);

        return mapToItemResponse(saved);
    }

    @Transactional
    public void deleteItem(UUID itemUuid) {
        OrganizerInventoryItem item = itemRepository.findByItemUuid(itemUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found"));
        itemRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public List<OrganizerInventoryLogResponse> getLogs(UUID organizationUuid, UUID itemUuid, UUID tournamentUuid) {
        List<OrganizerInventoryLog> list;
        if (itemUuid != null) {
            list = logRepository.findByItemUuidOrderByCreatedAtDesc(itemUuid);
        } else if (tournamentUuid != null) {
            list = logRepository.findByOrganizationUuidAndTournamentUuidOrderByCreatedAtDesc(organizationUuid, tournamentUuid);
        } else {
            list = logRepository.findByOrganizationUuidOrderByCreatedAtDesc(organizationUuid);
        }

        return list.stream().map(this::mapToLogResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrganizerInventorySummaryResponse getSummary(UUID organizationUuid, UUID tournamentUuid) {
        List<OrganizerInventoryItem> items;
        if (tournamentUuid != null) {
            items = itemRepository.findByOrganizationUuidAndTournamentUuidOrderByCreatedAtDesc(organizationUuid, tournamentUuid);
        } else {
            items = itemRepository.findByOrganizationUuidOrderByCreatedAtDesc(organizationUuid);
        }

        int totalCategories = items.size();
        int totalQuantity = 0;
        int inStockCount = 0;
        int lowStockCount = 0;
        int outOfStockCount = 0;
        BigDecimal estimatedTotalValue = BigDecimal.ZERO;
        Map<String, Integer> quantityByCategory = new HashMap<>();

        for (OrganizerInventoryItem item : items) {
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

        OrganizerInventorySummaryResponse summary = new OrganizerInventorySummaryResponse();
        summary.setTotalCategories(totalCategories);
        summary.setTotalQuantity(totalQuantity);
        summary.setInStockCount(inStockCount);
        summary.setLowStockCount(lowStockCount);
        summary.setOutOfStockCount(outOfStockCount);
        summary.setEstimatedTotalValue(estimatedTotalValue);
        summary.setQuantityByCategory(quantityByCategory);

        return summary;
    }

    private String fetchUserName(Long userId) {
        if (userId == null) return "Organizer Staff";
        try {
            return userProfileRepository.findByUserId(userId)
                    .map(p -> ((p.getFirstName() != null ? p.getFirstName() : "") + " " + (p.getLastName() != null ? p.getLastName() : "")).trim())
                    .filter(name -> !name.isEmpty())
                    .orElse("Organizer Staff");
        } catch (Exception e) {
            return "Organizer Staff";
        }
    }

    private OrganizerInventoryItemResponse mapToItemResponse(OrganizerInventoryItem item) {
        OrganizerInventoryItemResponse resp = new OrganizerInventoryItemResponse();
        resp.setItemId(item.getItemId());
        resp.setItemUuid(item.getItemUuid());
        resp.setOrganizationId(item.getOrganizationId());
        resp.setOrganizationUuid(item.getOrganizationUuid());
        resp.setTournamentUuid(item.getTournamentUuid());
        resp.setItemName(item.getItemName());
        resp.setCategory(item.getCategory());
        resp.setQuantity(item.getQuantity());
        resp.setMinThreshold(item.getMinThreshold());
        resp.setUnit(item.getUnit());
        resp.setLocation(item.getLocation());
        resp.setUnitCost(item.getUnitCost());
        resp.setStatus(item.getStatus());
        resp.setConditionStatus(item.getConditionStatus());
        resp.setIsRental(item.getIsRental());
        resp.setReturnDueDate(item.getReturnDueDate());
        resp.setImageUrl(item.getImageUrl());
        resp.setNotes(item.getNotes());
        resp.setCreatedBy(item.getCreatedBy());
        resp.setCreatedAt(item.getCreatedAt());
        resp.setUpdatedAt(item.getUpdatedAt());
        return resp;
    }

    private OrganizerInventoryLogResponse mapToLogResponse(OrganizerInventoryLog log) {
        OrganizerInventoryLogResponse resp = new OrganizerInventoryLogResponse();
        resp.setLogId(log.getLogId());
        resp.setLogUuid(log.getLogUuid());
        resp.setItemId(log.getItemId());
        resp.setItemUuid(log.getItemUuid());
        resp.setOrganizationId(log.getOrganizationId());
        resp.setOrganizationUuid(log.getOrganizationUuid());
        resp.setTournamentUuid(log.getTournamentUuid());
        resp.setChangeType(log.getChangeType());
        resp.setQuantityChange(log.getQuantityChange());
        resp.setQuantityAfter(log.getQuantityAfter());
        resp.setCourtNumber(log.getCourtNumber());
        resp.setRecipientName(log.getRecipientName());
        resp.setMemberUuid(log.getMemberUuid());
        resp.setLoggedByName(log.getLoggedByName());
        resp.setNotes(log.getNotes());
        resp.setCreatedAt(log.getCreatedAt());

        // Item metadata
        if (log.getItemUuid() != null) {
            itemRepository.findByItemUuid(log.getItemUuid()).ifPresent(item -> {
                resp.setItemName(item.getItemName());
                resp.setItemCategory(item.getCategory());
                resp.setUnit(item.getUnit());
            });
        }

        return resp;
    }
}
