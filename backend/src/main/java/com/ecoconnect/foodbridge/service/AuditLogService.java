package com.ecoconnect.foodbridge.service;

import com.ecoconnect.foodbridge.model.AuditLog;
import com.ecoconnect.foodbridge.model.User;
import com.ecoconnect.foodbridge.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuditLog record(User user, String action, String entityName, UUID entityId, String details, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress != null ? ipAddress : "0.0.0.0")
                .build();
        return auditLogRepository.save(log);
    }
}
