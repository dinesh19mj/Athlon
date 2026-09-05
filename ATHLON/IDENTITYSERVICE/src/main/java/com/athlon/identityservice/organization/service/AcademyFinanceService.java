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
import com.athlon.identityservice.organization.dto.request.CreateAcademyFinanceRequest;
import com.athlon.identityservice.organization.dto.request.UpdateAcademyFinanceRequest;
import com.athlon.identityservice.organization.dto.response.AcademyFinanceResponse;
import com.athlon.identityservice.organization.dto.response.AcademyFinanceSummaryResponse;
import com.athlon.identityservice.organization.entity.AcademyFinance;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.AcademyBatchRepository;
import com.athlon.identityservice.organization.repository.AcademyFinanceRepository;
import com.athlon.identityservice.organization.repository.AcademyStudentRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;

@Service
public class AcademyFinanceService {

    private final AcademyFinanceRepository financeRepository;
    private final OrganizationRepository organizationRepository;
    private final AcademyStudentRepository studentRepository;
    private final AcademyBatchRepository batchRepository;

    public AcademyFinanceService(
            AcademyFinanceRepository financeRepository,
            OrganizationRepository organizationRepository,
            AcademyStudentRepository studentRepository,
            AcademyBatchRepository batchRepository) {
        this.financeRepository = financeRepository;
        this.organizationRepository = organizationRepository;
        this.studentRepository = studentRepository;
        this.batchRepository = batchRepository;
    }

    @Transactional(readOnly = true)
    public List<AcademyFinanceResponse> getFinances(
            UUID organizationUuid,
            String transactionType,
            String category,
            UUID studentUuid,
            UUID batchUuid,
            LocalDate startDate,
            LocalDate endDate) {

        List<AcademyFinance> list;

        if (studentUuid != null) {
            list = financeRepository.findByOrganizationUuidAndStudentUuidOrderByTransactionDateDescCreatedAtDesc(
                    organizationUuid, studentUuid);
        } else if (batchUuid != null) {
            list = financeRepository.findByOrganizationUuidAndBatchUuidOrderByTransactionDateDescCreatedAtDesc(
                    organizationUuid, batchUuid);
        } else if (transactionType != null && !transactionType.trim().isEmpty() && !"ALL".equalsIgnoreCase(transactionType)) {
            if (startDate != null && endDate != null) {
                list = financeRepository.findByOrganizationUuidAndTransactionTypeAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
                        organizationUuid, transactionType.toUpperCase(), startDate, endDate);
            } else {
                list = financeRepository.findByOrganizationUuidAndTransactionTypeOrderByTransactionDateDescCreatedAtDesc(
                        organizationUuid, transactionType.toUpperCase());
            }
        } else {
            if (startDate != null && endDate != null) {
                list = financeRepository.findByOrganizationUuidAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
                        organizationUuid, startDate, endDate);
            } else {
                list = financeRepository.findByOrganizationUuidOrderByTransactionDateDescCreatedAtDesc(organizationUuid);
            }
        }

        // Apply in-memory filter for category if specified
        if (category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category)) {
            list = list.stream()
                    .filter(f -> f.getCategory() != null && f.getCategory().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public AcademyFinanceResponse createFinance(CreateAcademyFinanceRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Academy Organization not found"));

        AcademyFinance finance = new AcademyFinance();
        finance.setOrganizationId(organization.getOrganizationId());
        finance.setOrganizationUuid(organization.getOrganizationUuid());
        finance.setTransactionType(request.getTransactionType() != null ? request.getTransactionType().toUpperCase() : "INCOME");
        finance.setCategory(request.getCategory());
        finance.setTitle(request.getTitle());
        finance.setAmount(request.getAmount());
        finance.setTransactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDate.now());
        finance.setPaymentMethod(request.getPaymentMethod());
        finance.setPaidToOrBy(request.getPaidToOrBy());
        finance.setInvoiceNumber(request.getInvoiceNumber());
        finance.setFeeStatus(request.getFeeStatus() != null ? request.getFeeStatus().toUpperCase() : "PAID");
        finance.setNotes(request.getNotes());
        finance.setReceiptUrl(request.getReceiptUrl());
        finance.setCreatedBy(currentUserId);
        finance.setUpdatedBy(currentUserId);

        // Link student if provided
        if (request.getStudentUuid() != null) {
            finance.setStudentUuid(request.getStudentUuid());
            if (request.getStudentName() != null && !request.getStudentName().trim().isEmpty()) {
                finance.setStudentName(request.getStudentName().trim());
            } else {
                studentRepository.findByStudentUuid(request.getStudentUuid())
                        .ifPresent(s -> finance.setStudentName(s.getFullName()));
            }
        } else if (request.getStudentName() != null) {
            finance.setStudentName(request.getStudentName().trim());
        }

        // Link batch if provided
        if (request.getBatchUuid() != null) {
            finance.setBatchUuid(request.getBatchUuid());
            if (request.getBatchName() != null && !request.getBatchName().trim().isEmpty()) {
                finance.setBatchName(request.getBatchName().trim());
            } else {
                batchRepository.findByBatchUuid(request.getBatchUuid())
                        .ifPresent(b -> finance.setBatchName(b.getBatchName()));
            }
        } else if (request.getBatchName() != null) {
            finance.setBatchName(request.getBatchName().trim());
        }

        AcademyFinance saved = financeRepository.save(finance);
        return mapToResponse(saved);
    }

    @Transactional
    public AcademyFinanceResponse updateFinance(UpdateAcademyFinanceRequest request, Long currentUserId) {
        AcademyFinance finance = financeRepository.findByFinanceUuid(request.getFinanceUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Finance record not found"));

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
        if (request.getPaidToOrBy() != null) {
            finance.setPaidToOrBy(request.getPaidToOrBy());
        }
        if (request.getStudentUuid() != null) {
            finance.setStudentUuid(request.getStudentUuid());
        }
        if (request.getStudentName() != null) {
            finance.setStudentName(request.getStudentName());
        }
        if (request.getBatchUuid() != null) {
            finance.setBatchUuid(request.getBatchUuid());
        }
        if (request.getBatchName() != null) {
            finance.setBatchName(request.getBatchName());
        }
        if (request.getInvoiceNumber() != null) {
            finance.setInvoiceNumber(request.getInvoiceNumber());
        }
        if (request.getFeeStatus() != null) {
            finance.setFeeStatus(request.getFeeStatus().toUpperCase());
        }
        if (request.getNotes() != null) {
            finance.setNotes(request.getNotes());
        }
        if (request.getReceiptUrl() != null) {
            finance.setReceiptUrl(request.getReceiptUrl());
        }
        finance.setUpdatedBy(currentUserId);

        AcademyFinance saved = financeRepository.save(finance);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteFinance(UUID financeUuid) {
        AcademyFinance finance = financeRepository.findByFinanceUuid(financeUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Finance record not found"));
        financeRepository.delete(finance);
    }

    @Transactional(readOnly = true)
    public AcademyFinanceSummaryResponse getFinanceSummary(UUID organizationUuid, LocalDate startDate, LocalDate endDate) {
        List<AcademyFinance> list;
        if (startDate != null && endDate != null) {
            list = financeRepository.findByOrganizationUuidAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
                    organizationUuid, startDate, endDate);
        } else {
            list = financeRepository.findByOrganizationUuidOrderByTransactionDateDescCreatedAtDesc(organizationUuid);
        }

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        BigDecimal totalFeeCollected = BigDecimal.ZERO;
        int studentFeeCount = 0;
        Map<String, BigDecimal> expenseByCategory = new HashMap<>();
        Map<String, BigDecimal> incomeByCategory = new HashMap<>();

        for (AcademyFinance item : list) {
            BigDecimal amt = item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO;
            String cat = item.getCategory() != null ? item.getCategory() : "Other";

            if ("INCOME".equalsIgnoreCase(item.getTransactionType())) {
                totalIncome = totalIncome.add(amt);
                incomeByCategory.put(cat, incomeByCategory.getOrDefault(cat, BigDecimal.ZERO).add(amt));

                if (cat.toLowerCase().contains("fee") || cat.toLowerCase().contains("tuition") || cat.toLowerCase().contains("admission") || item.getStudentUuid() != null) {
                    totalFeeCollected = totalFeeCollected.add(amt);
                    studentFeeCount++;
                }
            } else {
                totalExpense = totalExpense.add(amt);
                expenseByCategory.put(cat, expenseByCategory.getOrDefault(cat, BigDecimal.ZERO).add(amt));
            }
        }

        BigDecimal netBalance = totalIncome.subtract(totalExpense);

        AcademyFinanceSummaryResponse summary = new AcademyFinanceSummaryResponse();
        summary.setTotalIncome(totalIncome);
        summary.setTotalExpense(totalExpense);
        summary.setNetBalance(netBalance);
        summary.setTotalFeeCollected(totalFeeCollected);
        summary.setTransactionCount(list.size());
        summary.setStudentFeePaymentCount(studentFeeCount);
        summary.setExpenseByCategory(expenseByCategory);
        summary.setIncomeByCategory(incomeByCategory);

        return summary;
    }

    private AcademyFinanceResponse mapToResponse(AcademyFinance finance) {
        AcademyFinanceResponse resp = new AcademyFinanceResponse();
        resp.setFinanceId(finance.getFinanceId());
        resp.setFinanceUuid(finance.getFinanceUuid());
        resp.setOrganizationId(finance.getOrganizationId());
        resp.setOrganizationUuid(finance.getOrganizationUuid());
        resp.setTransactionType(finance.getTransactionType());
        resp.setCategory(finance.getCategory());
        resp.setTitle(finance.getTitle());
        resp.setAmount(finance.getAmount());
        resp.setTransactionDate(finance.getTransactionDate());
        resp.setPaymentMethod(finance.getPaymentMethod());
        resp.setPaidToOrBy(finance.getPaidToOrBy());
        resp.setStudentUuid(finance.getStudentUuid());
        resp.setStudentName(finance.getStudentName());
        resp.setBatchUuid(finance.getBatchUuid());
        resp.setBatchName(finance.getBatchName());
        resp.setInvoiceNumber(finance.getInvoiceNumber());
        resp.setFeeStatus(finance.getFeeStatus());
        resp.setNotes(finance.getNotes());
        resp.setReceiptUrl(finance.getReceiptUrl());
        resp.setCreatedBy(finance.getCreatedBy());
        resp.setCreatedAt(finance.getCreatedAt());
        resp.setUpdatedAt(finance.getUpdatedAt());
        return resp;
    }
}
