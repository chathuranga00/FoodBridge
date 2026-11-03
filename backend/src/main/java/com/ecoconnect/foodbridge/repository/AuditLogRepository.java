package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    List<AuditLog> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<AuditLog> findByEntityNameAndEntityIdOrderByCreatedAtDesc(String entityName, UUID entityId);

    List<AuditLog> findByActionOrderByCreatedAtDesc(String action);

    List<AuditLog> findByEntityNameOrderByCreatedAtDesc(String entityName);

    List<AuditLog> findByActionAndEntityNameOrderByCreatedAtDesc(String action, String entityName);

    List<AuditLog> findAllByOrderByCreatedAtDesc();

    List<AuditLog> findTop100ByOrderByCreatedAtDesc();

    List<AuditLog> findTop200ByOrderByCreatedAtDesc();
}
