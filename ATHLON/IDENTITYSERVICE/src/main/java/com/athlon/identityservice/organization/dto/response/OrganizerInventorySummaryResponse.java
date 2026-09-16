package com.athlon.identityservice.organization.dto.response;

import java.math.BigDecimal;
import java.util.Map;

public class OrganizerInventorySummaryResponse {

    private long totalCategories;
    private long totalQuantity;
    private long inStockCount;
    private long lowStockCount;
    private long outOfStockCount;
    private BigDecimal estimatedTotalValue;
    private Map<String, Integer> quantityByCategory;

    public OrganizerInventorySummaryResponse() {
    }

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public long getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(long totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public long getInStockCount() {
        return inStockCount;
    }

    public void setInStockCount(long inStockCount) {
        this.inStockCount = inStockCount;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public long getOutOfStockCount() {
        return outOfStockCount;
    }

    public void setOutOfStockCount(long outOfStockCount) {
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
