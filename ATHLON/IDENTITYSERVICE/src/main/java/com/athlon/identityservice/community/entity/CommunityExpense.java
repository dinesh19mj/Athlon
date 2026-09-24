package com.athlon.identityservice.community.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.athlon.identityservice.community.enums.ExpenseCategory;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "community_expenses")
public class CommunityExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "expense_id", updatable = false, nullable = false)
    private Long expenseId;

    @Column(name = "expense_uuid", updatable = false, nullable = false, unique = true)
    private UUID expenseUuid;

    @Column(name = "community_uuid", nullable = false)
    private UUID communityUuid;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 40)
    private ExpenseCategory category = ExpenseCategory.OTHER;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "paid_by_user_name", length = 150)
    private String paidByUserName;

    @Column(name = "paid_by_user_uuid")
    private UUID paidByUserUuid;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "receipt_url", length = 500)
    private String receiptUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CommunityExpense() {
    }

    @PrePersist
    public void prePersist() {
        if (expenseUuid == null) {
            expenseUuid = UUID.randomUUID();
        }
        if (category == null) category = ExpenseCategory.OTHER;
        if (expenseDate == null) expenseDate = LocalDate.now();
    }

    public Long getExpenseId() {
        return expenseId;
    }

    public void setExpenseId(Long expenseId) {
        this.expenseId = expenseId;
    }

    public UUID getExpenseUuid() {
        return expenseUuid;
    }

    public void setExpenseUuid(UUID expenseUuid) {
        this.expenseUuid = expenseUuid;
    }

    public UUID getCommunityUuid() {
        return communityUuid;
    }

    public void setCommunityUuid(UUID communityUuid) {
        this.communityUuid = communityUuid;
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

    public UUID getPaidByUserUuid() {
        return paidByUserUuid;
    }

    public void setPaidByUserUuid(UUID paidByUserUuid) {
        this.paidByUserUuid = paidByUserUuid;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
