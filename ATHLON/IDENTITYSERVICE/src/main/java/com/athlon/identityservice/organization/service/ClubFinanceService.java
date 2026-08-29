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
import com.athlon.identityservice.organization.dto.request.CreateFinanceRequest;
import com.athlon.identityservice.organization.dto.request.UpdateFinanceRequest;
import com.athlon.identityservice.organization.dto.response.ClubFinanceResponse;
import com.athlon.identityservice.organization.dto.response.FinanceSummaryResponse;
import com.athlon.identityservice.organization.entity.ClubFinance;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.entity.OrganizationMember;
import com.athlon.identityservice.organization.repository.ClubFinanceRepository;
import com.athlon.identityservice.organization.repository.OrganizationMemberRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.user.repository.UserProfileRepository;

@Service
public class ClubFinanceService {

    private final ClubFinanceRepository financeRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserProfileRepository userProfileRepository;

    public ClubFinanceService(
            ClubFinanceRepository financeRepository,
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository organizationMemberRepository,
            UserProfileRepository userProfileRepository) {
        this.financeRepository = financeRepository;
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional(readOnly = true)
    public List<ClubFinanceResponse> getFinances(
            UUID organizationUuid,
            String transactionType,
            LocalDate startDate,
            LocalDate endDate) {

        List<ClubFinance> list;

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

    @Transactional
    public ClubFinanceResponse createFinance(CreateFinanceRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        ClubFinance finance = new ClubFinance();
        finance.setOrganizationId(organization.getOrganizationId());
        finance.setOrganizationUuid(organization.getOrganizationUuid());
        finance.setTransactionType(request.getTransactionType() != null ? request.getTransactionType().toUpperCase() : "EXPENSE");
        finance.setCategory(request.getCategory());
        finance.setTitle(request.getTitle());
        finance.setAmount(request.getAmount());
        finance.setTransactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDate.now());
        finance.setPaymentMethod(request.getPaymentMethod());
        finance.setPaidToOrBy(request.getPaidToOrBy());
        finance.setMemberUuid(request.getMemberUuid());
        finance.setNotes(request.getNotes());
        finance.setReceiptUrl(request.getReceiptUrl());
        finance.setCreatedBy(currentUserId);
        finance.setUpdatedBy(currentUserId);

        ClubFinance saved = financeRepository.save(finance);
        return mapToResponse(saved);
    }

    @Transactional
    public ClubFinanceResponse updateFinance(UpdateFinanceRequest request, Long currentUserId) {
        ClubFinance finance = financeRepository.findByFinanceUuid(request.getFinanceUuid())
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
        if (request.getMemberUuid() != null) {
            finance.setMemberUuid(request.getMemberUuid());
        }
        if (request.getNotes() != null) {
            finance.setNotes(request.getNotes());
        }
        if (request.getReceiptUrl() != null) {
            finance.setReceiptUrl(request.getReceiptUrl());
        }
        finance.setUpdatedBy(currentUserId);

        ClubFinance saved = financeRepository.save(finance);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteFinance(UUID financeUuid) {
        ClubFinance finance = financeRepository.findByFinanceUuid(financeUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction record not found"));
        financeRepository.delete(finance);
    }

    @Transactional(readOnly = true)
    public FinanceSummaryResponse getFinanceSummary(UUID organizationUuid, LocalDate startDate, LocalDate endDate) {
        List<ClubFinance> list;
        if (startDate != null && endDate != null) {
            list = financeRepository.findByOrganizationUuidAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
                    organizationUuid, startDate, endDate);
        } else {
            list = financeRepository.findByOrganizationUuidOrderByTransactionDateDescCreatedAtDesc(organizationUuid);
        }

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        Map<String, BigDecimal> expenseByCategory = new HashMap<>();
        Map<String, BigDecimal> incomeByCategory = new HashMap<>();

        for (ClubFinance item : list) {
            BigDecimal amt = item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO;
            String cat = item.getCategory() != null ? item.getCategory() : "Other";

            if ("INCOME".equalsIgnoreCase(item.getTransactionType())) {
                totalIncome = totalIncome.add(amt);
                incomeByCategory.put(cat, incomeByCategory.getOrDefault(cat, BigDecimal.ZERO).add(amt));
            } else {
                totalExpense = totalExpense.add(amt);
                expenseByCategory.put(cat, expenseByCategory.getOrDefault(cat, BigDecimal.ZERO).add(amt));
            }
        }

        BigDecimal netBalance = totalIncome.subtract(totalExpense);

        FinanceSummaryResponse summary = new FinanceSummaryResponse();
        summary.setTotalIncome(totalIncome);
        summary.setTotalExpense(totalExpense);
        summary.setNetBalance(netBalance);
        summary.setTransactionCount(list.size());
        summary.setExpenseByCategory(expenseByCategory);
        summary.setIncomeByCategory(incomeByCategory);

        return summary;
    }

    private ClubFinanceResponse mapToResponse(ClubFinance finance) {
        ClubFinanceResponse resp = new ClubFinanceResponse();
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
        resp.setMemberUuid(finance.getMemberUuid());
        resp.setNotes(finance.getNotes());
        resp.setReceiptUrl(finance.getReceiptUrl());
        resp.setCreatedBy(finance.getCreatedBy());
        resp.setCreatedAt(finance.getCreatedAt());
        resp.setUpdatedAt(finance.getUpdatedAt());

        // Populate member name if linked to a member
        if (finance.getMemberUuid() != null) {
            try {
                organizationMemberRepository.findByOrganizationMemberUuid(finance.getMemberUuid())
                        .ifPresent(m -> {
                            if (m.getUserId() != null) {
                                userProfileRepository.findByUserId(m.getUserId()).ifPresent(p -> {
                                    String fullName = ((p.getFirstName() != null ? p.getFirstName() : "") + " " + (p.getLastName() != null ? p.getLastName() : "")).trim();
                                    resp.setMemberName(fullName.isEmpty() ? "Athlete" : fullName);
                                });
                            }
                        });
            } catch (Exception ignored) {
                // Safeguard against missing profile lookups
            }
        }

        return resp;
    }
}
