package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.AnimalOrganization;
import com.ecoconnect.foodbridge.model.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AnimalOrganizationRepository extends JpaRepository<AnimalOrganization, UUID> {

    Optional<AnimalOrganization> findByUserId(UUID userId);

    Optional<AnimalOrganization> findByRegistrationNumber(String registrationNumber);

    List<AnimalOrganization> findByVerificationStatus(VerificationStatus status);

    List<AnimalOrganization> findByDistrictAndVerificationStatus(String district, VerificationStatus status);

    boolean existsByRegistrationNumber(String registrationNumber);
}

