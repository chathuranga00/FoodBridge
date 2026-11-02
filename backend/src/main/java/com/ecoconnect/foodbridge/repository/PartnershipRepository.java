package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.Partnership;
import com.ecoconnect.foodbridge.model.enums.PartnershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PartnershipRepository extends JpaRepository<Partnership, UUID> {

    List<Partnership> findByBusinessId(UUID businessId);

    List<Partnership> findByCharityId(UUID charityId);

    List<Partnership> findByAnimalOrgId(UUID animalOrgId);

    List<Partnership> findByStatus(PartnershipStatus status);
}

