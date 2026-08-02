package com.athlon.tournament.inventory.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.athlon.tournament.inventory.entity.InventoryItem;
import com.athlon.tournament.inventory.repository.InventoryRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    public InventoryItem addItem(InventoryItem item) {
        item.setCreatedOn(LocalDateTime.now());
        if (item.getStatus() == null) {
            item.setStatus("IN_STOCK");
        }
        return inventoryRepository.save(item);
    }

    public InventoryItem updateStock(Long itemId, Integer quantityAdded) {
        InventoryItem existingItem = inventoryRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Item not found"));
        
        int newQuantity = existingItem.getQuantityInStock() + quantityAdded;
        existingItem.setQuantityInStock(newQuantity);
        
        if (newQuantity <= 0) {
            existingItem.setStatus("OUT_OF_STOCK");
        } else if (existingItem.getReorderLevel() != null && newQuantity <= existingItem.getReorderLevel()) {
            existingItem.setStatus("LOW_STOCK");
        } else {
            existingItem.setStatus("IN_STOCK");
        }
        
        existingItem.setModifiedOn(LocalDateTime.now());
        return inventoryRepository.save(existingItem);
    }

    public List<InventoryItem> getInventoryByOrg(Long orgId) {
        return inventoryRepository.findByOrgId(orgId);
    }
}
