package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.AnimalFeedRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnimalFeedRequirementRepository extends JpaRepository<AnimalFeedRequirement, UUID> {

    List<AnimalFeedRequirement> findByAnimalOrgIdOrderByCreatedAtDesc(UUID animalOrgId);

    List<AnimalFeedRequirement> findByIsActiveTrueOrderByCreatedAtDesc();

    List<AnimalFeedRequirement> findByAnimalOrgDistrictAndIsActiveTrueOrderByCreatedAtDesc(String district);
}
