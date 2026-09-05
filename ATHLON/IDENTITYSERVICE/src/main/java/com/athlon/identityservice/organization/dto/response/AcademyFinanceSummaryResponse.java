package com.athlon.identityservice.organization.dto.response;

import java.math.BigDecimal;
import java.util.Map;

public class AcademyFinanceSummaryResponse {

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netBalance;
    private BigDecimal totalFeeCollected;
    private BigDecimal pendingFeeAmount;
    private int transactionCount;
    private int studentFeePaymentCount;
    private Map<String, BigDecimal> expenseByCategory;
    private Map<String, BigDecimal> incomeByCategory;

    public AcademyFinanceSummaryResponse() {
        this.totalIncome = BigDecimal.ZERO;
        this.totalExpense = BigDecimal.ZERO;
        this.netBalance = BigDecimal.ZERO;
        this.totalFeeCollected = BigDecimal.ZERO;
        this.pendingFeeAmount = BigDecimal.ZERO;
        this.transactionCount = 0;
        this.studentFeePaymentCount = 0;
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

    public BigDecimal getTotalFeeCollected() {
        return totalFeeCollected;
    }

    public void setTotalFeeCollected(BigDecimal totalFeeCollected) {
        this.totalFeeCollected = totalFeeCollected;
    }

    public BigDecimal getPendingFeeAmount() {
        return pendingFeeAmount;
    }

    public void setPendingFeeAmount(BigDecimal pendingFeeAmount) {
        this.pendingFeeAmount = pendingFeeAmount;
    }

    public int getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(int transactionCount) {
        this.transactionCount = transactionCount;
    }

    public int getStudentFeePaymentCount() {
        return studentFeePaymentCount;
    }

    public void setStudentFeePaymentCount(int studentFeePaymentCount) {
        this.studentFeePaymentCount = studentFeePaymentCount;
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
