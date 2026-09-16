package com.athlon.identityservice.organization.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

public class UpdateOrganizerFinanceRequest {

    private UUID financeUuid;

    private UUID tournamentUuid;

    private String tournamentName;

    private String transactionType;

    private String category;

    @Size(max = 150, message = "Title cannot exceed 150 characters")
    private String title;

    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    private LocalDate transactionDate;

    private String paymentMethod;

    private String paymentStatus;

    private String paidToOrBy;

    private String invoiceOrReceiptNo;

    private String receiptUrl;

    private String notes;

    public UpdateOrganizerFinanceRequest() {
    }

    public UUID getFinanceUuid() {
        return financeUuid;
    }

    public void setFinanceUuid(UUID financeUuid) {
        this.financeUuid = financeUuid;
    }

    public UUID getTournamentUuid() {
        return tournamentUuid;
    }

    public void setTournamentUuid(UUID tournamentUuid) {
        this.tournamentUuid = tournamentUuid;
    }

    public String getTournamentName() {
        return tournamentName;
    }

    public void setTournamentName(String tournamentName) {
        this.tournamentName = tournamentName;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaidToOrBy() {
        return paidToOrBy;
    }

    public void setPaidToOrBy(String paidToOrBy) {
        this.paidToOrBy = paidToOrBy;
    }

    public String getInvoiceOrReceiptNo() {
        return invoiceOrReceiptNo;
    }

    public void setInvoiceOrReceiptNo(String invoiceOrReceiptNo) {
        this.invoiceOrReceiptNo = invoiceOrReceiptNo;
    }

    public String getReceiptUrl() {
        return receiptUrl;
    }

    public void setReceiptUrl(String receiptUrl) {
        this.receiptUrl = receiptUrl;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
