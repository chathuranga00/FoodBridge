package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.ImpactRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ImpactRecordRepository extends JpaRepository<ImpactRecord, UUID> {

    Optional<ImpactRecord> findByActivityRecordId(UUID activityRecordId);

    @Query("SELECT COALESCE(SUM(i.mealsRescued), 0) FROM ImpactRecord i")
    Long sumTotalMealsRescued();

    @Query("SELECT COALESCE(SUM(i.foodWeightKg), 0) FROM ImpactRecord i")
    BigDecimal sumTotalFoodWeightKg();

    @Query("SELECT COALESCE(SUM(i.co2SavingsKg), 0) FROM ImpactRecord i")
    BigDecimal sumTotalCo2SavingsKg();

    @Query("SELECT COALESCE(SUM(i.peopleFed), 0) FROM ImpactRecord i")
    Long sumTotalPeopleFed();

    @Query("SELECT COALESCE(SUM(i.animalsFed), 0) FROM ImpactRecord i")
    Long sumTotalAnimalsFed();
}

