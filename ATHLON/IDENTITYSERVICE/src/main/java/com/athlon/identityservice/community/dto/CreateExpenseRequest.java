package com.athlon.identityservice.community.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.athlon.identityservice.community.enums.ExpenseCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateExpenseRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Expense category is required")
    private ExpenseCategory category = ExpenseCategory.OTHER;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private LocalDate expenseDate = LocalDate.now();
    private String paidByUserName;
    private String notes;
    private String receiptUrl;

    public CreateExpenseRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public ExpenseCategory getCategory() {
        return category;
    }

    public void setCategory(ExpenseCategory category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }

    public String getPaidByUserName() {
        return paidByUserName;
    }

    public void setPaidByUserName(String paidByUserName) {
        this.paidByUserName = paidByUserName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getReceiptUrl() {
        return receiptUrl;
    }

    public void setReceiptUrl(String receiptUrl) {
        this.receiptUrl = receiptUrl;
    }
}
