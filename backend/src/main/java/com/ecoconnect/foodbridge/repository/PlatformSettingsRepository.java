package com.ecoconnect.foodbridge.repository;

import com.ecoconnect.foodbridge.model.PlatformSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatformSettingsRepository extends JpaRepository<PlatformSettings, String> {
}

