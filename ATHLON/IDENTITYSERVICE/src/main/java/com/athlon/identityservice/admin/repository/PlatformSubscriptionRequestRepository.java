package com.athlon.identityservice.admin.repository;

import com.athlon.identityservice.admin.entity.PlatformSubscriptionRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlatformSubscriptionRequestRepository extends JpaRepository<PlatformSubscriptionRequest, Long> {

    Optional<PlatformSubscriptionRequest> findByRequestUuid(UUID requestUuid);

    Page<PlatformSubscriptionRequest> findByRequestStatusOrderByCreatedAtDesc(String requestStatus, Pageable pageable);

    Page<PlatformSubscriptionRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<PlatformSubscriptionRequest> findByOrganizationUuid(UUID organizationUuid);

    long countByRequestStatus(String requestStatus);
}
