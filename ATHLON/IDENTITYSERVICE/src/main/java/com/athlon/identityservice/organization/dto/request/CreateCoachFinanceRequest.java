package com.athlon.identityservice.organization.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateCoachFinanceRequest {

    @NotNull(message = "Organization UUID is required")
    private UUID organizationUuid;

    @NotBlank(message = "Transaction type is required (INCOME or EXPENSE)")
    private String transactionType;

    @NotBlank(message = "Category is required")
    @Size(max = 60)
    private String category;

    @NotBlank(message = "Title is required")
    @Size(max = 150)
    private String title;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    private LocalDate transactionDate;

    private String paymentMethod; // UPI, CASH, BANK_TRANSFER, CARD, CHEQUE

    private String paidToOrBy;

    private UUID traineeUuid;

    private String traineeName;

    private UUID packageUuid;

    private String packageName;

    private String invoiceNumber;

    private String feeStatus; // PAID, PENDING, PARTIAL, REFUNDED

    private String notes;

    private String receiptUrl;

    public CreateCoachFinanceRequest() {
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
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

    public String getPaidToOrBy() {
        return paidToOrBy;
    }

    public void setPaidToOrBy(String paidToOrBy) {
        this.paidToOrBy = paidToOrBy;
    }

    public UUID getTraineeUuid() {
        return traineeUuid;
    }

    public void setTraineeUuid(UUID traineeUuid) {
        this.traineeUuid = traineeUuid;
    }

    public String getTraineeName() {
        return traineeName;
    }

    public void setTraineeName(String traineeName) {
        this.traineeName = traineeName;
    }

    public UUID getPackageUuid() {
        return packageUuid;
    }

    public void setPackageUuid(UUID packageUuid) {
        this.packageUuid = packageUuid;
    }

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public String getFeeStatus() {
        return feeStatus;
    }

    public void setFeeStatus(String feeStatus) {
        this.feeStatus = feeStatus;
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
