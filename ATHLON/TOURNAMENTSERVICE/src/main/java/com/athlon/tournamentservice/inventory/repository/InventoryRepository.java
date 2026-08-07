package com.athlon.tournamentservice.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.athlon.tournamentservice.inventory.entity.InventoryItem;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findByOrgId(Long orgId);
    List<InventoryItem> findByOrgIdAndCategory(Long orgId, String category);
}

