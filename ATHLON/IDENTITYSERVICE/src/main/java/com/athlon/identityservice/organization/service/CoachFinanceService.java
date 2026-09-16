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
import com.athlon.identityservice.organization.dto.request.CreateCoachFinanceRequest;
import com.athlon.identityservice.organization.dto.request.UpdateCoachFinanceRequest;
import com.athlon.identityservice.organization.dto.response.CoachFinanceResponse;
import com.athlon.identityservice.organization.dto.response.CoachFinanceSummaryResponse;
import com.athlon.identityservice.organization.entity.CoachFeePackage;
import com.athlon.identityservice.organization.entity.CoachFinance;
import com.athlon.identityservice.organization.entity.CoachTrainee;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.CoachFeePackageRepository;
import com.athlon.identityservice.organization.repository.CoachFinanceRepository;
import com.athlon.identityservice.organization.repository.CoachTraineeRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;

@Service
public class CoachFinanceService {

    private final CoachFinanceRepository financeRepository;
    private final OrganizationRepository organizationRepository;
    private final CoachTraineeRepository traineeRepository;
    private final CoachFeePackageRepository packageRepository;

    public CoachFinanceService(
            CoachFinanceRepository financeRepository,
            OrganizationRepository organizationRepository,
            CoachTraineeRepository traineeRepository,
            CoachFeePackageRepository packageRepository) {
        this.financeRepository = financeRepository;
        this.organizationRepository = organizationRepository;
        this.traineeRepository = traineeRepository;
        this.packageRepository = packageRepository;
    }

    @Transactional(readOnly = true)
    public List<CoachFinanceResponse> getFinances(
            UUID organizationUuid,
            String transactionType,
            LocalDate startDate,
            LocalDate endDate) {

        List<CoachFinance> list;

        if (transactionType != null && !transactionType.trim().isEmpty() && !"ALL".equalsIgnoreCase(transactionType)) {
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

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CoachFinanceResponse> getTraineeFinances(UUID organizationUuid, UUID traineeUuid) {
        List<CoachFinance> list = financeRepository.findByOrganizationUuidAndTraineeUuidOrderByTransactionDateDescCreatedAtDesc(
                organizationUuid, traineeUuid);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public CoachFinanceResponse createFinance(CreateCoachFinanceRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        CoachFinance finance = new CoachFinance();
        finance.setOrganizationId(organization.getOrganizationId());
        finance.setOrganizationUuid(organization.getOrganizationUuid());
        finance.setTransactionType(request.getTransactionType() != null ? request.getTransactionType().toUpperCase() : "EXPENSE");
        finance.setCategory(request.getCategory());
        finance.setTitle(request.getTitle());
        finance.setAmount(request.getAmount());
        finance.setTransactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDate.now());
        finance.setPaymentMethod(request.getPaymentMethod());
        finance.setPaidToOrBy(request.getPaidToOrBy());

        // Link trainee snapshot if provided
        if (request.getTraineeUuid() != null) {
            finance.setTraineeUuid(request.getTraineeUuid());
            if (request.getTraineeName() != null && !request.getTraineeName().trim().isEmpty()) {
                finance.setTraineeName(request.getTraineeName());
            } else {
                traineeRepository.findByTraineeUuid(request.getTraineeUuid())
                        .ifPresent(t -> finance.setTraineeName(t.getFullName()));
            }
        }

        // Link package snapshot if provided
        if (request.getPackageUuid() != null) {
            finance.setPackageUuid(request.getPackageUuid());
            if (request.getPackageName() != null && !request.getPackageName().trim().isEmpty()) {
                finance.setPackageName(request.getPackageName());
            } else {
                packageRepository.findByPackageUuid(request.getPackageUuid())
                        .ifPresent(p -> finance.setPackageName(p.getName()));
            }
        }

        // Generate invoice number if not provided
        if (request.getInvoiceNumber() != null && !request.getInvoiceNumber().trim().isEmpty()) {
            finance.setInvoiceNumber(request.getInvoiceNumber());
        } else {
            String prefix = "INCOME".equalsIgnoreCase(finance.getTransactionType()) ? "INV-COACH-" : "EXP-COACH-";
            finance.setInvoiceNumber(prefix + System.currentTimeMillis() % 1000000);
        }

        finance.setFeeStatus(request.getFeeStatus() != null ? request.getFeeStatus() : "PAID");
        finance.setNotes(request.getNotes());
        finance.setReceiptUrl(request.getReceiptUrl());
        finance.setCreatedBy(currentUserId);
        finance.setUpdatedBy(currentUserId);

        CoachFinance saved = financeRepository.save(finance);
        return mapToResponse(saved);
    }

    @Transactional
    public CoachFinanceResponse updateFinance(UpdateCoachFinanceRequest request, Long currentUserId) {
        CoachFinance finance = financeRepository.findByFinanceUuid(request.getFinanceUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction record not found"));

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
        if (request.getTraineeUuid() != null) {
            finance.setTraineeUuid(request.getTraineeUuid());
        }
        if (request.getTraineeName() != null) {
            finance.setTraineeName(request.getTraineeName());
        }
        if (request.getPackageUuid() != null) {
            finance.setPackageUuid(request.getPackageUuid());
        }
        if (request.getPackageName() != null) {
            finance.setPackageName(request.getPackageName());
        }
        if (request.getInvoiceNumber() != null) {
            finance.setInvoiceNumber(request.getInvoiceNumber());
        }
        if (request.getFeeStatus() != null) {
            finance.setFeeStatus(request.getFeeStatus());
        }
        if (request.getNotes() != null) {
            finance.setNotes(request.getNotes());
        }
        if (request.getReceiptUrl() != null) {
            finance.setReceiptUrl(request.getReceiptUrl());
        }
        finance.setUpdatedBy(currentUserId);

        CoachFinance saved = financeRepository.save(finance);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteFinance(UUID financeUuid) {
        CoachFinance finance = financeRepository.findByFinanceUuid(financeUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction record not found"));
        financeRepository.delete(finance);
    }

    @Transactional(readOnly = true)
    public CoachFinanceSummaryResponse getFinanceSummary(UUID organizationUuid, LocalDate startDate, LocalDate endDate) {
        List<CoachFinance> list;
        if (startDate != null && endDate != null) {
            list = financeRepository.findByOrganizationUuidAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
                    organizationUuid, startDate, endDate);
        } else {
            list = financeRepository.findByOrganizationUuidOrderByTransactionDateDescCreatedAtDesc(organizationUuid);
        }

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        BigDecimal pendingReceivables = BigDecimal.ZERO;
        Map<String, BigDecimal> expenseByCategory = new HashMap<>();
        Map<String, BigDecimal> incomeByCategory = new HashMap<>();

        for (CoachFinance item : list) {
            BigDecimal amt = item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO;
            String cat = item.getCategory() != null ? item.getCategory() : "Other";

            if ("INCOME".equalsIgnoreCase(item.getTransactionType())) {
                if ("PENDING".equalsIgnoreCase(item.getFeeStatus())) {
                    pendingReceivables = pendingReceivables.add(amt);
                } else {
                    totalIncome = totalIncome.add(amt);
                    incomeByCategory.put(cat, incomeByCategory.getOrDefault(cat, BigDecimal.ZERO).add(amt));
                }
            } else {
                totalExpense = totalExpense.add(amt);
                expenseByCategory.put(cat, expenseByCategory.getOrDefault(cat, BigDecimal.ZERO).add(amt));
            }
        }

        BigDecimal netProfit = totalIncome.subtract(totalExpense);

        CoachFinanceSummaryResponse summary = new CoachFinanceSummaryResponse();
        summary.setTotalIncome(totalIncome);
        summary.setTotalExpense(totalExpense);
        summary.setNetProfit(netProfit);
        summary.setPendingReceivables(pendingReceivables);
        summary.setTransactionCount(list.size());
        summary.setExpenseByCategory(expenseByCategory);
        summary.setIncomeByCategory(incomeByCategory);

        return summary;
    }

    private CoachFinanceResponse mapToResponse(CoachFinance finance) {
        CoachFinanceResponse resp = new CoachFinanceResponse();
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
        resp.setTraineeUuid(finance.getTraineeUuid());
        resp.setTraineeName(finance.getTraineeName());
        resp.setPackageUuid(finance.getPackageUuid());
        resp.setPackageName(finance.getPackageName());
        resp.setInvoiceNumber(finance.getInvoiceNumber());
        resp.setFeeStatus(finance.getFeeStatus());
        resp.setNotes(finance.getNotes());
        resp.setReceiptUrl(finance.getReceiptUrl());
        resp.setCreatedBy(finance.getCreatedBy());
        resp.setCreatedAt(finance.getCreatedAt());
        resp.setUpdatedAt(finance.getUpdatedAt());

        // If traineeName is missing but traineeUuid exists, fill it
        if ((resp.getTraineeName() == null || resp.getTraineeName().isEmpty()) && finance.getTraineeUuid() != null) {
            try {
                traineeRepository.findByTraineeUuid(finance.getTraineeUuid())
                        .ifPresent(t -> resp.setTraineeName(t.getFullName()));
            } catch (Exception ignored) {
            }
        }

        return resp;
    }
}
