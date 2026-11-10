package com.athlon.identityservice.admin.repository;

import com.athlon.identityservice.admin.entity.OrganizationModuleConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationModuleConfigRepository extends JpaRepository<OrganizationModuleConfig, String> {

    List<OrganizationModuleConfig> findAllByOrderByDisplayOrderAsc();

    List<OrganizationModuleConfig> findByIsEnabledTrueOrderByDisplayOrderAsc();

    Optional<OrganizationModuleConfig> findByModuleKeyIgnoreCase(String moduleKey);

    boolean existsByModuleKeyIgnoreCase(String moduleKey);
}

