package com.athlon.tournamentservice.finance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.athlon.tournamentservice.finance.entity.Expense;
import com.athlon.tournamentservice.finance.entity.Income;
import com.athlon.tournamentservice.finance.repository.ExpenseRepository;
import com.athlon.tournamentservice.finance.repository.IncomeRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FinanceService {

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    public Income recordIncome(Income income) {
        income.setCreatedOn(LocalDateTime.now());
        if (income.getStatus() == null) {
            income.setStatus("COMPLETED");
        }
        return incomeRepository.save(income);
    }

    public List<Income> getIncomeByOrg(Long orgId) {
        return incomeRepository.findByOrgId(orgId);
    }

    public Expense recordExpense(Expense expense) {
        expense.setCreatedOn(LocalDateTime.now());
        if (expense.getStatus() == null) {
            expense.setStatus("COMPLETED");
        }
        return expenseRepository.save(expense);
    }

    public List<Expense> getExpenseByOrg(Long orgId) {
        return expenseRepository.findByOrgId(orgId);
    }
}

