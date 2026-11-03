package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.VolunteerOpportunity;
import com.ecoconnect.foodbridge.model.enums.OpportunityStatus;
import com.ecoconnect.foodbridge.model.enums.VolunteerOpportunityCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VolunteerOpportunityRepository extends JpaRepository<VolunteerOpportunity, UUID> {

    List<VolunteerOpportunity> findByStatusOrderByEventDateAsc(OpportunityStatus status);

    List<VolunteerOpportunity> findByCategoryAndStatusOrderByEventDateAsc(VolunteerOpportunityCategory category, OpportunityStatus status);

    List<VolunteerOpportunity> findByDistrictIgnoreCaseAndStatusOrderByEventDateAsc(String district, OpportunityStatus status);

    List<VolunteerOpportunity> findByOrganizerUserIdOrderByCreatedAtDesc(UUID organizerUserId);

    List<VolunteerOpportunity> findByCharityIdOrderByCreatedAtDesc(UUID charityId);
}

