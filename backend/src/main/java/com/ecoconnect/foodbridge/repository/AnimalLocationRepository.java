package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.AnimalLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnimalLocationRepository extends JpaRepository<AnimalLocation, UUID> {

    List<AnimalLocation> findByDistrictAndIsActiveTrue(String district);

    List<AnimalLocation> findByAnimalOrgId(UUID animalOrgId);

    List<AnimalLocation> findByAnimalOrgIdOrderByCreatedAtDesc(UUID animalOrgId);

    List<AnimalLocation> findByIsActiveTrue();

    List<AnimalLocation> findByIsActiveTrueOrderByCreatedAtDesc();
}

