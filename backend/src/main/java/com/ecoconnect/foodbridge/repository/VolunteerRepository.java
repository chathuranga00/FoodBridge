package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.Volunteer;
import com.ecoconnect.foodbridge.model.enums.VerificationStatus;
import com.ecoconnect.foodbridge.model.enums.VolunteerAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VolunteerRepository extends JpaRepository<Volunteer, UUID> {

    Optional<Volunteer> findByUserId(UUID userId);

    List<Volunteer> findByAvailabilityStatus(VolunteerAvailability availabilityStatus);

    List<Volunteer> findByVerificationStatus(VerificationStatus verificationStatus);

    long countByVerificationStatus(VerificationStatus verificationStatus);

    List<Volunteer> findByAvailabilityStatusAndVerificationStatus(VolunteerAvailability availabilityStatus, VerificationStatus verificationStatus);
}

