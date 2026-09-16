package com.athlon.identityservice.organization.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "organizer_finances")
public class OrganizerFinance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "finance_id", updatable = false, nullable = false)
    private Long financeId;

    @Column(name = "finance_uuid", updatable = false, nullable = false, unique = true)
    private UUID financeUuid;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(name = "organization_uuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "tournament_id")
    private Long tournamentId;

    @Column(name = "tournament_uuid")
    private UUID tournamentUuid;

    @Column(name = "tournament_name", length = 150)
    private String tournamentName;

    @Column(name = "transaction_type", nullable = false, length = 20)
    private String transactionType; // EXPENSE or INCOME

    @Column(name = "category", nullable = false, length = 60)
    private String category;
    // Income: REGISTRATION_FEES, SPONSORSHIPS, TICKET_SALES, MERCHANDISE_CONCESSIONS, PRIZE_GRANTS, OTHER_INCOME
    // Expense: PRIZE_MONEY, VENUE_COURT_RENTAL, UMPIRES_OFFICIALS, EQUIPMENT_SHUTTLES, MARKETING_STREAMING, HOSPITALITY_REFRESHMENTS, LOGISTICS_PRINTING, OTHER_EXPENSE

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "payment_method", length = 30)
    private String paymentMethod; // UPI, CASH, BANK_TRANSFER, CARD, CHEQUE

    @Column(name = "payment_status", length = 20)
    private String paymentStatus; // PAID, PENDING

    @Column(name = "paid_to_or_by", length = 100)
    private String paidToOrBy; // Sponsor name, Athlete name, Vendor name, Umpire name

    @Column(name = "invoice_or_receipt_no", length = 80)
    private String invoiceOrReceiptNo;

    @Column(name = "receipt_url", length = 255)
    private String receiptUrl;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public OrganizerFinance() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.financeUuid == null) {
            this.financeUuid = UUID.randomUUID();
        }
        if (this.transactionDate == null) {
            this.transactionDate = LocalDate.now();
        }
        if (this.paymentStatus == null) {
            this.paymentStatus = "PAID";
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getFinanceId() {
        return financeId;
    }

    public void setFinanceId(Long financeId) {
        this.financeId = financeId;
    }

    public UUID getFinanceUuid() {
        return financeUuid;
    }

    public void setFinanceUuid(UUID financeUuid) {
        this.financeUuid = financeUuid;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public Long getTournamentId() {
        return tournamentId;
    }

    public void setTournamentId(Long tournamentId) {
        this.tournamentId = tournamentId;
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

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
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
