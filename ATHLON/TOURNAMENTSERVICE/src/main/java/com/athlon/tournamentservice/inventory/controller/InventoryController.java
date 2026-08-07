package com.athlon.tournamentservice.inventory.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.tournamentservice.inventory.entity.InventoryItem;
import com.athlon.tournamentservice.inventory.service.InventoryService;

import java.util.List;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @PostMapping("/add")
    public ResponseEntity<InventoryItem> addItem(@RequestBody InventoryItem item) {
        try {
            InventoryItem saved = inventoryService.addItem(item);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/updateStock/{itemId}")
    public ResponseEntity<InventoryItem> updateStock(
            @PathVariable("itemId") Long itemId,
            @RequestParam("quantityAdded") Integer quantityAdded) {
        try {
            InventoryItem updated = inventoryService.updateStock(itemId, quantityAdded);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<InventoryItem>> getInventoryByOrg(@PathVariable("orgId") Long orgId) {
        try {
            List<InventoryItem> items = inventoryService.getInventoryByOrg(orgId);
            return new ResponseEntity<>(items, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

