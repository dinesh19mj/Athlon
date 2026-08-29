package com.athlon.identityservice.organization.dto.response;

import java.math.BigDecimal;
import java.util.Map;

public class FinanceSummaryResponse {

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netBalance;
    private int transactionCount;
    private Map<String, BigDecimal> expenseByCategory;
    private Map<String, BigDecimal> incomeByCategory;

    public FinanceSummaryResponse() {
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(BigDecimal totalExpense) {
        this.totalExpense = totalExpense;
    }

    public BigDecimal getNetBalance() {
        return netBalance;
    }

    public void setNetBalance(BigDecimal netBalance) {
        this.netBalance = netBalance;
    }

    public int getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(int transactionCount) {
        this.transactionCount = transactionCount;
    }

    public Map<String, BigDecimal> getExpenseByCategory() {
        return expenseByCategory;
    }

    public void setExpenseByCategory(Map<String, BigDecimal> expenseByCategory) {
        this.expenseByCategory = expenseByCategory;
    }

    public Map<String, BigDecimal> getIncomeByCategory() {
        return incomeByCategory;
    }

    public void setIncomeByCategory(Map<String, BigDecimal> incomeByCategory) {
        this.incomeByCategory = incomeByCategory;
    }
}
