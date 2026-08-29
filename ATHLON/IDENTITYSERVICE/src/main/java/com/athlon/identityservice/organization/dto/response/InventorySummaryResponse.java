package com.athlon.identityservice.organization.dto.response;

import java.math.BigDecimal;
import java.util.Map;

public class InventorySummaryResponse {

    private int totalCategories;
    private int totalQuantity;
    private int inStockCount;
    private int lowStockCount;
    private int outOfStockCount;
    private BigDecimal estimatedTotalValue;
    private Map<String, Integer> quantityByCategory;

    public InventorySummaryResponse() {
    }

    public int getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(int totalCategories) {
        this.totalCategories = totalCategories;
    }

    public int getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(int totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public int getInStockCount() {
        return inStockCount;
    }

    public void setInStockCount(int inStockCount) {
        this.inStockCount = inStockCount;
    }

    public int getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(int lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public int getOutOfStockCount() {
        return outOfStockCount;
    }

    public void setOutOfStockCount(int outOfStockCount) {
        this.outOfStockCount = outOfStockCount;
    }

    public BigDecimal getEstimatedTotalValue() {
        return estimatedTotalValue;
    }

    public void setEstimatedTotalValue(BigDecimal estimatedTotalValue) {
        this.estimatedTotalValue = estimatedTotalValue;
    }

    public Map<String, Integer> getQuantityByCategory() {
        return quantityByCategory;
    }

    public void setQuantityByCategory(Map<String, Integer> quantityByCategory) {
        this.quantityByCategory = quantityByCategory;
    }
}
