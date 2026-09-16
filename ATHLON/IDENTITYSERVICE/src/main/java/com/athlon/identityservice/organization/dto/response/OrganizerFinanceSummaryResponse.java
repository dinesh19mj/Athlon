package com.athlon.identityservice.organization.dto.response;

import java.math.BigDecimal;
import java.util.Map;

public class OrganizerFinanceSummaryResponse {

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netProfit;
    private BigDecimal pendingReceivables;
    private BigDecimal pendingPayables;
    private int transactionCount;
    private Map<String, BigDecimal> incomeByCategory;
    private Map<String, BigDecimal> expenseByCategory;
    private Map<String, BigDecimal> netByTournament;

    public OrganizerFinanceSummaryResponse() {
        this.totalIncome = BigDecimal.ZERO;
        this.totalExpense = BigDecimal.ZERO;
        this.netProfit = BigDecimal.ZERO;
        this.pendingReceivables = BigDecimal.ZERO;
        this.pendingPayables = BigDecimal.ZERO;
        this.transactionCount = 0;
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

    public BigDecimal getNetProfit() {
        return netProfit;
    }

    public void setNetProfit(BigDecimal netProfit) {
        this.netProfit = netProfit;
    }

    public BigDecimal getPendingReceivables() {
        return pendingReceivables;
    }

    public void setPendingReceivables(BigDecimal pendingReceivables) {
        this.pendingReceivables = pendingReceivables;
    }

    public BigDecimal getPendingPayables() {
        return pendingPayables;
    }

    public void setPendingPayables(BigDecimal pendingPayables) {
        this.pendingPayables = pendingPayables;
    }

    public int getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(int transactionCount) {
        this.transactionCount = transactionCount;
    }

    public Map<String, BigDecimal> getIncomeByCategory() {
        return incomeByCategory;
    }

    public void setIncomeByCategory(Map<String, BigDecimal> incomeByCategory) {
        this.incomeByCategory = incomeByCategory;
    }

    public Map<String, BigDecimal> getExpenseByCategory() {
        return expenseByCategory;
    }

    public void setExpenseByCategory(Map<String, BigDecimal> expenseByCategory) {
        this.expenseByCategory = expenseByCategory;
    }

    public Map<String, BigDecimal> getNetByTournament() {
        return netByTournament;
    }

    public void setNetByTournament(Map<String, BigDecimal> netByTournament) {
        this.netByTournament = netByTournament;
    }
}
