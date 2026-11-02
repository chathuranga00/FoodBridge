package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.Charity;
import com.ecoconnect.foodbridge.model.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CharityRepository extends JpaRepository<Charity, UUID> {

    Optional<Charity> findByUserId(UUID userId);

    Optional<Charity> findByRegistrationNumber(String registrationNumber);

    List<Charity> findByVerificationStatus(VerificationStatus status);

    List<Charity> findByDistrictAndVerificationStatus(String district, VerificationStatus status);

    boolean existsByRegistrationNumber(String registrationNumber);
}

