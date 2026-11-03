package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.PartnershipMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PartnershipMessageRepository extends JpaRepository<PartnershipMessage, UUID> {

    List<PartnershipMessage> findByPartnershipIdOrderByCreatedAtAsc(UUID partnershipId);
}

