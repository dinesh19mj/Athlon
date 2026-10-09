package com.athlon.identityservice.admin.service;

import com.athlon.identityservice.admin.dto.AdminDashboardStatsResponse;
import com.athlon.identityservice.admin.repository.PlatformSubscriptionRequestRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.organizationsubscription.repository.OrganizationSubscriptionRepository;
import com.athlon.identityservice.subscription.repository.SubscriptionPackageRepository;
import com.athlon.identityservice.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final SubscriptionPackageRepository subscriptionPackageRepository;
    private final OrganizationSubscriptionRepository organizationSubscriptionRepository;
    private final PlatformSubscriptionRequestRepository platformSubscriptionRequestRepository;

    public AdminDashboardService(UserRepository userRepository,
                                 OrganizationRepository organizationRepository,
                                 SubscriptionPackageRepository subscriptionPackageRepository,
                                 OrganizationSubscriptionRepository organizationSubscriptionRepository,
                                 PlatformSubscriptionRequestRepository platformSubscriptionRequestRepository) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.subscriptionPackageRepository = subscriptionPackageRepository;
        this.organizationSubscriptionRepository = organizationSubscriptionRepository;
        this.platformSubscriptionRequestRepository = platformSubscriptionRequestRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getDashboardStats() {
        AdminDashboardStatsResponse stats = new AdminDashboardStatsResponse();

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActive(1);
        long suspendedUsers = totalUsers - activeUsers;

        stats.setTotalUsers(totalUsers);
        stats.setActiveUsers(activeUsers);
        stats.setSuspendedUsers(Math.max(0, suspendedUsers));

        long totalOrgs = organizationRepository.count();
        long activeOrgs = organizationRepository.countByIsActive(1);
        stats.setTotalOrganizations(totalOrgs);
        stats.setActiveOrganizations(activeOrgs);

        Map<String, Long> orgsByType = new HashMap<>();
        String[] types = {"CLUB", "ACADEMY", "COURT", "VENUE", "ORGANIZER", "COACH", "COMMUNITY"};
        for (String type : types) {
            long count = organizationRepository.countByType(type);
            if (count > 0) {
                orgsByType.put(type, count);
            }
        }
        stats.setOrganizationsByType(orgsByType);

        stats.setTotalPackages(subscriptionPackageRepository.count());
        stats.setActiveSubscriptions(organizationSubscriptionRepository.countByStatus("ACTIVE"));
        stats.setPendingSubscriptionRequests(platformSubscriptionRequestRepository.countByRequestStatus("PENDING"));

        // Tournaments placeholder / initial count (can be enriched or aggregated)
        stats.setTotalTournaments(0);

        return stats;
    }
}
