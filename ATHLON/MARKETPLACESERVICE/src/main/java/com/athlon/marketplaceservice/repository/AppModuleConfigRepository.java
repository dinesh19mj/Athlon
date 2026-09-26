package com.athlon.marketplaceservice.repository;

import com.athlon.marketplaceservice.entity.AppModuleConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppModuleConfigRepository extends JpaRepository<AppModuleConfig, Long> {
    Optional<AppModuleConfig> findByConfigKey(String configKey);
}
