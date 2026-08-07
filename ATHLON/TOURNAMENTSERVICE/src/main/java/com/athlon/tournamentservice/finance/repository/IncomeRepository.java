package com.athlon.tournamentservice.finance.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.athlon.tournamentservice.finance.entity.Income;
import java.util.List;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findByOrgId(Long orgId);
    List<Income> findByOrgIdAndFeeMonth(Long orgId, String feeMonth);
}

