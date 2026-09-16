package com.athlon.identityservice.organization.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.dto.request.CreateOrganizerFinanceRequest;
import com.athlon.identityservice.organization.dto.request.UpdateOrganizerFinanceRequest;
import com.athlon.identityservice.organization.dto.response.OrganizerFinanceResponse;
import com.athlon.identityservice.organization.dto.response.OrganizerFinanceSummaryResponse;
import com.athlon.identityservice.organization.entity.OrganizerFinance;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.OrganizerFinanceRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;

@Service
public class OrganizerFinanceService {

    private final OrganizerFinanceRepository financeRepository;
    private final OrganizationRepository organizationRepository;

    public OrganizerFinanceService(
            OrganizerFinanceRepository financeRepository,
            OrganizationRepository organizationRepository) {
        this.financeRepository = financeRepository;
        this.organizationRepository = organizationRepository;
    }

    @Transactional(readOnly = true)
    public List<OrganizerFinanceResponse> getFinances(
            UUID organizationUuid,
            UUID tournamentUuid,
            String transactionType,
            LocalDate startDate,
            LocalDate endDate) {

        List<OrganizerFinance> list;

        boolean hasTournament = tournamentUuid != null;
        boolean hasType = transactionType != null && !transactionType.trim().isEmpty() && !"ALL".equalsIgnoreCase(transactionType);
        boolean hasDates = startDate != null && endDate != null;

        if (hasTournament) {
            if (hasType) {
                if (hasDates) {
                    list = financeRepository.findByOrganizationUuidAndTournamentUuidAndTransactionTypeAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
                            organizationUuid, tournamentUuid, transactionType.toUpperCase(), startDate, endDate);
                } else {
                    list = financeRepository.findByOrganizationUuidAndTournamentUuidAndTransactionTypeOrderByTransactionDateDescCreatedAtDesc(
                            organizationUuid, tournamentUuid, transactionType.toUpperCase());
                }
            } else {
                if (hasDates) {
                    list = financeRepository.findByOrganizationUuidAndTournamentUuidAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
                            organizationUuid, tournamentUuid, startDate, endDate);
                } else {
                    list = financeRepository.findByOrganizationUuidAndTournamentUuidOrderByTransactionDateDescCreatedAtDesc(
                            organizationUuid, tournamentUuid);
                }
            }
        } else {
            if (hasType) {
                if (hasDates) {
                    list = financeRepository.findByOrganizationUuidAndTransactionTypeAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
                            organizationUuid, transactionType.toUpperCase(), startDate, endDate);
                } else {
                    list = financeRepository.findByOrganizationUuidAndTransactionTypeOrderByTransactionDateDescCreatedAtDesc(
                            organizationUuid, transactionType.toUpperCase());
                }
            } else {
                if (hasDates) {
                    list = financeRepository.findByOrganizationUuidAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
                            organizationUuid, startDate, endDate);
                } else {
                    list = financeRepository.findByOrganizationUuidOrderByTransactionDateDescCreatedAtDesc(
                            organizationUuid);
                }
            }
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrganizerFinanceSummaryResponse getSummary(
            UUID organizationUuid,
            UUID tournamentUuid,
            LocalDate startDate,
            LocalDate endDate) {

        List<OrganizerFinanceResponse> finances = getFinances(organizationUuid, tournamentUuid, null, startDate, endDate);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        BigDecimal pendingReceivables = BigDecimal.ZERO;
        BigDecimal pendingPayables = BigDecimal.ZERO;

        Map<String, BigDecimal> incomeByCategory = new HashMap<>();
        Map<String, BigDecimal> expenseByCategory = new HashMap<>();
        Map<String, BigDecimal> netByTournament = new HashMap<>();

        for (OrganizerFinanceResponse item : finances) {
            BigDecimal amt = item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO;
            String cat = item.getCategory() != null ? item.getCategory() : "OTHER";
            String tName = item.getTournamentName() != null && !item.getTournamentName().trim().isEmpty() 
                    ? item.getTournamentName() 
                    : "General / Unassigned";

            boolean isPending = "PENDING".equalsIgnoreCase(item.getPaymentStatus()) || "PARTIAL".equalsIgnoreCase(item.getPaymentStatus());

            if ("INCOME".equalsIgnoreCase(item.getTransactionType())) {
                totalIncome = totalIncome.add(amt);
                incomeByCategory.put(cat, incomeByCategory.getOrDefault(cat, BigDecimal.ZERO).add(amt));
                netByTournament.put(tName, netByTournament.getOrDefault(tName, BigDecimal.ZERO).add(amt));
                if (isPending) {
                    pendingReceivables = pendingReceivables.add(amt);
                }
            } else {
                totalExpense = totalExpense.add(amt);
                expenseByCategory.put(cat, expenseByCategory.getOrDefault(cat, BigDecimal.ZERO).add(amt));
                netByTournament.put(tName, netByTournament.getOrDefault(tName, BigDecimal.ZERO).subtract(amt));
                if (isPending) {
                    pendingPayables = pendingPayables.add(amt);
                }
            }
        }

        BigDecimal netProfit = totalIncome.subtract(totalExpense);

        OrganizerFinanceSummaryResponse summary = new OrganizerFinanceSummaryResponse();
        summary.setTotalIncome(totalIncome);
        summary.setTotalExpense(totalExpense);
        summary.setNetProfit(netProfit);
        summary.setPendingReceivables(pendingReceivables);
        summary.setPendingPayables(pendingPayables);
        summary.setTransactionCount(finances.size());
        summary.setIncomeByCategory(incomeByCategory);
        summary.setExpenseByCategory(expenseByCategory);
        summary.setNetByTournament(netByTournament);

        return summary;
    }

    @Transactional
    public OrganizerFinanceResponse createFinance(CreateOrganizerFinanceRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        OrganizerFinance finance = new OrganizerFinance();
        finance.setOrganizationId(organization.getOrganizationId());
        finance.setOrganizationUuid(organization.getOrganizationUuid());
        finance.setTournamentUuid(request.getTournamentUuid());
        finance.setTournamentName(request.getTournamentName());
        finance.setTransactionType(request.getTransactionType() != null ? request.getTransactionType().toUpperCase() : "EXPENSE");
        finance.setCategory(request.getCategory());
        finance.setTitle(request.getTitle());
        finance.setAmount(request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO);
        finance.setTransactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDate.now());
        finance.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI");
        finance.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus().toUpperCase() : "COMPLETED");
        finance.setPaidToOrBy(request.getPaidToOrBy());
        finance.setInvoiceOrReceiptNo(request.getInvoiceOrReceiptNo());
        finance.setReceiptUrl(request.getReceiptUrl());
        finance.setNotes(request.getNotes());
        finance.setCreatedBy(currentUserId);
        finance.setUpdatedBy(currentUserId);

        OrganizerFinance saved = financeRepository.save(finance);
        return mapToResponse(saved);
    }

    @Transactional
    public OrganizerFinanceResponse updateFinance(UpdateOrganizerFinanceRequest request, Long currentUserId) {
        OrganizerFinance finance = financeRepository.findByFinanceUuid(request.getFinanceUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Finance transaction record not found"));

        if (request.getTournamentUuid() != null) {
            finance.setTournamentUuid(request.getTournamentUuid());
        }
        if (request.getTournamentName() != null) {
            finance.setTournamentName(request.getTournamentName());
        }
        if (request.getTransactionType() != null) {
            finance.setTransactionType(request.getTransactionType().toUpperCase());
        }
        if (request.getCategory() != null) {
            finance.setCategory(request.getCategory());
        }
        if (request.getTitle() != null) {
            finance.setTitle(request.getTitle());
        }
        if (request.getAmount() != null) {
            finance.setAmount(request.getAmount());
        }
        if (request.getTransactionDate() != null) {
            finance.setTransactionDate(request.getTransactionDate());
        }
        if (request.getPaymentMethod() != null) {
            finance.setPaymentMethod(request.getPaymentMethod());
        }
        if (request.getPaymentStatus() != null) {
            finance.setPaymentStatus(request.getPaymentStatus().toUpperCase());
        }
        if (request.getPaidToOrBy() != null) {
            finance.setPaidToOrBy(request.getPaidToOrBy());
        }
        if (request.getInvoiceOrReceiptNo() != null) {
            finance.setInvoiceOrReceiptNo(request.getInvoiceOrReceiptNo());
        }
        if (request.getReceiptUrl() != null) {
            finance.setReceiptUrl(request.getReceiptUrl());
        }
        if (request.getNotes() != null) {
            finance.setNotes(request.getNotes());
        }
        finance.setUpdatedBy(currentUserId);

        OrganizerFinance saved = financeRepository.save(finance);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteFinance(UUID financeUuid) {
        OrganizerFinance finance = financeRepository.findByFinanceUuid(financeUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Finance transaction record not found"));
        financeRepository.delete(finance);
    }

    private OrganizerFinanceResponse mapToResponse(OrganizerFinance finance) {
        OrganizerFinanceResponse resp = new OrganizerFinanceResponse();
        resp.setFinanceUuid(finance.getFinanceUuid());
        resp.setOrganizationUuid(finance.getOrganizationUuid());
        resp.setTournamentUuid(finance.getTournamentUuid());
        resp.setTournamentName(finance.getTournamentName());
        resp.setTransactionType(finance.getTransactionType());
        resp.setCategory(finance.getCategory());
        resp.setTitle(finance.getTitle());
        resp.setAmount(finance.getAmount());
        resp.setTransactionDate(finance.getTransactionDate());
        resp.setPaymentMethod(finance.getPaymentMethod());
        resp.setPaymentStatus(finance.getPaymentStatus());
        resp.setPaidToOrBy(finance.getPaidToOrBy());
        resp.setInvoiceOrReceiptNo(finance.getInvoiceOrReceiptNo());
        resp.setReceiptUrl(finance.getReceiptUrl());
        resp.setNotes(finance.getNotes());
        resp.setCreatedAt(finance.getCreatedAt());
        resp.setUpdatedAt(finance.getUpdatedAt());
        return resp;
    }
}
