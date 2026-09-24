package com.athlon.paymentservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.paymentservice.entity.PaymentAuditLog;

@Repository
public interface PaymentAuditLogRepository extends JpaRepository<PaymentAuditLog, Long> {

    List<PaymentAuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, String entityId);
}
