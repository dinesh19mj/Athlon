package com.athlon.tournament.finance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.athlon.tournament.finance.entity.Expense;
import com.athlon.tournament.finance.entity.Income;
import com.athlon.tournament.finance.repository.ExpenseRepository;
import com.athlon.tournament.finance.repository.IncomeRepository;

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
