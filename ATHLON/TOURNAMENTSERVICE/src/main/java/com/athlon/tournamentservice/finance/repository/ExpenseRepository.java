package com.athlon.tournamentservice.finance.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.athlon.tournamentservice.finance.entity.Expense;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByOrgId(Long orgId);
}

