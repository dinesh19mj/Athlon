package com.athlon.tournament.finance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.tournament.finance.entity.Expense;
import com.athlon.tournament.finance.entity.Income;
import com.athlon.tournament.finance.service.FinanceService;

import java.util.List;

@RestController
@RequestMapping("/finance")
public class FinanceController {

    @Autowired
    private FinanceService financeService;

    @PostMapping("/income/add")
    public ResponseEntity<Income> addIncome(@RequestBody Income income) {
        try {
            Income saved = financeService.recordIncome(income);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/income/org/{orgId}")
    public ResponseEntity<List<Income>> getIncomeByOrg(@PathVariable("orgId") Long orgId) {
        try {
            List<Income> incomes = financeService.getIncomeByOrg(orgId);
            return new ResponseEntity<>(incomes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/expense/add")
    public ResponseEntity<Expense> addExpense(@RequestBody Expense expense) {
        try {
            Expense saved = financeService.recordExpense(expense);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/expense/org/{orgId}")
    public ResponseEntity<List<Expense>> getExpenseByOrg(@PathVariable("orgId") Long orgId) {
        try {
            List<Expense> expenses = financeService.getExpenseByOrg(orgId);
            return new ResponseEntity<>(expenses, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
