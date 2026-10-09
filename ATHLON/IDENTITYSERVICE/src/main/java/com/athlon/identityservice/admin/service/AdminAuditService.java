package com.athlon.identityservice.admin.service;

import com.athlon.identityservice.admin.entity.PlatformAdminAuditLog;
import com.athlon.identityservice.admin.repository.PlatformAdminAuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AdminAuditService {

    private final PlatformAdminAuditLogRepository auditLogRepository;

    public AdminAuditService(PlatformAdminAuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void record(Long adminUserId,
                       UUID adminUserUuid,
                       String adminEmail,
                       String action,
                       String entityType,
                       String entityId,
                       String previousState,
                       String newState,
                       String reason,
                       String requestIp) {
        try {
            PlatformAdminAuditLog log = new PlatformAdminAuditLog(
                    adminUserId != null ? adminUserId : 0L,
                    adminUserUuid != null ? adminUserUuid : UUID.randomUUID(),
                    adminEmail != null ? adminEmail : "admin@athlon.co.in",
                    action,
                    entityType,
                    entityId,
                    previousState,
                    newState,
                    reason,
                    requestIp
            );
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Log error but do not fail the parent transaction if audit insert encounters issue
            org.slf4j.LoggerFactory.getLogger(AdminAuditService.class)
                    .error("Failed to write platform audit log: {}", e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<PlatformAdminAuditLog> getLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
