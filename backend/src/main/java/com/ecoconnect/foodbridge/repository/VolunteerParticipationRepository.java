package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.VolunteerParticipation;
import com.ecoconnect.foodbridge.model.enums.ParticipationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VolunteerParticipationRepository extends JpaRepository<VolunteerParticipation, UUID> {

    List<VolunteerParticipation> findByUserIdOrderByRegisteredAtDesc(UUID userId);

    List<VolunteerParticipation> findByOpportunityIdOrderByRegisteredAtAsc(UUID opportunityId);

    Optional<VolunteerParticipation> findByOpportunityIdAndUserId(UUID opportunityId, UUID userId);

    boolean existsByOpportunityIdAndUserIdAndStatusNot(UUID opportunityId, UUID userId, ParticipationStatus status);

    long countByOpportunityIdAndStatus(UUID opportunityId, ParticipationStatus status);

    long countByStatus(ParticipationStatus status);

    @Query("SELECT COALESCE(SUM(vp.hoursVolunteered), 0) FROM VolunteerParticipation vp WHERE vp.status = :status")
    BigDecimal sumHoursVolunteeredByStatus(@Param("status") ParticipationStatus status);

    @Query("SELECT COUNT(DISTINCT vp.user.id) FROM VolunteerParticipation vp WHERE vp.status = :status")
    long countDistinctVolunteersByStatus(@Param("status") ParticipationStatus status);

    @Query("SELECT COUNT(DISTINCT vp.user.id) FROM VolunteerParticipation vp WHERE vp.opportunity.charity.id = :charityId AND vp.status = :status")
    long countDistinctVolunteersByCharityIdAndStatus(@Param("charityId") UUID charityId, @Param("status") ParticipationStatus status);

    @Query("SELECT COALESCE(SUM(vp.hoursVolunteered), 0) FROM VolunteerParticipation vp WHERE vp.opportunity.charity.id = :charityId AND vp.status = :status")
    BigDecimal sumHoursVolunteeredByCharityIdAndStatus(@Param("charityId") UUID charityId, @Param("status") ParticipationStatus status);
}
