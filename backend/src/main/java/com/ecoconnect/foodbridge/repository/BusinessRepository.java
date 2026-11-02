package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.Business;
import com.ecoconnect.foodbridge.model.enums.BusinessType;
import com.ecoconnect.foodbridge.model.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusinessRepository extends JpaRepository<Business, UUID> {

    Optional<Business> findByUserId(UUID userId);

    Optional<Business> findByRegistrationNumber(String registrationNumber);

    List<Business> findByVerificationStatus(VerificationStatus status);

    List<Business> findByBusinessTypeAndVerificationStatus(BusinessType businessType, VerificationStatus status);

    List<Business> findByDistrictAndVerificationStatus(String district, VerificationStatus status);

    boolean existsByRegistrationNumber(String registrationNumber);
}

