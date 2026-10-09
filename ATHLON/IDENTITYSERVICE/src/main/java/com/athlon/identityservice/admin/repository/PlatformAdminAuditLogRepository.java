package com.athlon.identityservice.admin.repository;

import com.athlon.identityservice.admin.entity.PlatformAdminAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlatformAdminAuditLogRepository extends JpaRepository<PlatformAdminAuditLog, Long> {

    Optional<PlatformAdminAuditLog> findByAuditUuid(UUID auditUuid);

    Page<PlatformAdminAuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<PlatformAdminAuditLog> findByAction(String action, Pageable pageable);

    Page<PlatformAdminAuditLog> findByEntityType(String entityType, Pageable pageable);
}
