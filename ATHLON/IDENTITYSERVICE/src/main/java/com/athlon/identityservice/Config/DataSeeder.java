package com.athlon.identityservice.config;

import com.athlon.identityservice.location.entity.Country;
import com.athlon.identityservice.location.entity.District;
import com.athlon.identityservice.location.entity.State;
import com.athlon.identityservice.location.repository.CountryRepository;
import com.athlon.identityservice.location.repository.DistrictRepository;
import com.athlon.identityservice.location.repository.StateRepository;
import com.athlon.identityservice.subscription.entity.SubscriptionPackage;
import com.athlon.identityservice.subscription.repository.SubscriptionPackageRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(
            SubscriptionPackageRepository repository,
            CountryRepository countryRepository,
            StateRepository stateRepository,
            DistrictRepository districtRepository) {
        return args -> {
            if (repository.count() == 0) {
                repository.saveAll(List.of(
                        new SubscriptionPackage("Tournament Organizer", 
                                "The ultimate multi-sport experience for hosting tournaments, managing brackets, and live broadcasting.", 
                                new BigDecimal("1200"), 1, 
                                "[\"Multi-Sport Organizing\", \"Advanced Bracket Generation\", \"Umpiring Interface\", \"Live YouTube Streaming\"]"),
                        new SubscriptionPackage("Academy Hub", 
                                "End-to-end management for sports academies, student rosters, coaches, and training schedules.", 
                                new BigDecimal("7900"), 1, 
                                "[\"Student Roster & Profiles\", \"Billing & Invoicing\", \"Coach Assignments\", \"Performance Tracking\"]"),
                        new SubscriptionPackage("Club Management", 
                                "Run your local sports club efficiently with member management and facility booking.", 
                                new BigDecimal("6300"), 1, 
                                "[\"Member Directory\", \"Facility Booking\", \"Internal Club Tournaments\", \"Financial Analytics\"]"),
                        new SubscriptionPackage("Court Provider", 
                                "List your courts for booking, manage availability, and handle payments.", 
                                new BigDecimal("3100"), 1, 
                                "[\"Dynamic Court Scheduling\", \"Payment Processing\", \"Player Reviews\", \"Booking Analytics\"]")
                ));
            }

            // Seed Location Master Data
            Country india = countryRepository.findAll().stream()
                    .filter(c -> "India".equalsIgnoreCase(c.getName()) || "IN".equalsIgnoreCase(c.getIsoCode()))
                    .findFirst()
                    .orElseGet(() -> countryRepository.save(new Country("India", "IN", 1L)));

            Map<String, List<String>> stateDistricts = Map.of(
                    "Kerala", List.of(
                            "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", 
                            "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", 
                            "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"
                    ),
                    "Tamil Nadu", List.of(
                            "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", 
                            "Tirunelveli", "Erode", "Vellore", "Kanyakumari", "Thanjavur"
                    ),
                    "Karnataka", List.of(
                            "Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru (Dakshina Kannada)", 
                            "Hubballi-Dharwad", "Belagavi", "Udupi", "Shimoga", "Tumakuru"
                    ),
                    "Maharashtra", List.of(
                            "Mumbai City", "Mumbai Suburban", "Pune", "Nagpur", "Thane", 
                            "Nashik", "Aurangabad", "Kolhapur", "Solapur"
                    ),
                    "Delhi", List.of(
                            "Central Delhi", "East Delhi", "New Delhi", "North Delhi", 
                            "South Delhi", "West Delhi"
                    ),
                    "Telangana", List.of(
                            "Hyderabad", "Rangareddy", "Medchal-Malkajgiri", "Warangal", "Nizamabad"
                    ),
                    "Andhra Pradesh", List.of(
                            "Visakhapatnam", "Vijayawada (NTR)", "Guntur", "Tirupati", "Nellore"
                    ),
                    "Gujarat", List.of(
                            "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"
                    ),
                    "Rajasthan", List.of(
                            "Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"
                    ),
                    "Uttar Pradesh", List.of(
                            "Lucknow", "Noida (Gautam Buddha Nagar)", "Kanpur", "Varanasi", "Agra", "Ghaziabad"
                    )
            );

            List<String> otherStates = List.of(
                    "Assam", "Bihar", "Chhattisgarh", "Goa", "Haryana", 
                    "Himachal Pradesh", "Jharkhand", "Madhya Pradesh", "Odisha", 
                    "Punjab", "Uttarakhand", "West Bengal"
            );

            for (Map.Entry<String, List<String>> entry : stateDistricts.entrySet()) {
                String stateName = entry.getKey();
                State state = stateRepository.findByNameIgnoreCase(stateName).orElseGet(() -> {
                    State s = new State(india.getId(), india.getUuid(), stateName, 1L);
                    return stateRepository.save(s);
                });

                for (String districtName : entry.getValue()) {
                    if (!districtRepository.existsByNameAndStateId(districtName, state.getId())) {
                        District d = new District(state.getId(), state.getUuid(), districtName, 1L);
                        districtRepository.save(d);
                    }
                }
            }

            for (String stateName : otherStates) {
                if (stateRepository.findByNameIgnoreCase(stateName).isEmpty()) {
                    State s = new State(india.getId(), india.getUuid(), stateName, 1L);
                    stateRepository.save(s);
                }
            }
        };
    }
}
