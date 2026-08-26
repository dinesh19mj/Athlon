package com.athlon.tournamentservice.teamchampionship.service;

import com.athlon.tournamentservice.auction.entity.AuctionCategoryConfig;
import com.athlon.tournamentservice.auction.entity.AuctionConfig;
import com.athlon.tournamentservice.auction.repository.AuctionCategoryConfigRepository;
import com.athlon.tournamentservice.auction.repository.AuctionConfigRepository;
import com.athlon.tournamentservice.teamchampionship.dto.request.*;
import com.athlon.tournamentservice.teamchampionship.dto.response.TeamChampionshipDetailDTO;
import com.athlon.tournamentservice.teamchampionship.entity.*;
import com.athlon.tournamentservice.teamchampionship.repository.*;
import com.athlon.tournamentservice.util.FileStorageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
public class TeamChampionshipService {

    private final TeamChampionshipRepository championshipRepository;
    private final ChampionshipCategoryRepository categoryRepository;
    private final ChampionshipMatchFormatRepository matchFormatRepository;
    private final ChampionshipEventRepository eventRepository;
    private final TeamChampionshipPoolRepository poolRepository;
    private final ChampionshipRulesConfigRepository rulesConfigRepository;
    private final ChampionshipTeamRegistrationRepository teamRegistrationRepository;
    private final ChampionshipPlayerRegistrationRepository playerRegistrationRepository;
    private final AuctionConfigRepository auctionConfigRepository;
    private final AuctionCategoryConfigRepository auctionCategoryConfigRepository;
    private final FileStorageUtil fileStorageUtil;

    @Value("${athlon.championship.poster.upload.directory:C:\\Users\\neoni\\Desktop\\Athlon\\Championship\\Poster}")
    private String posterUploadDir;

    @Autowired
    public TeamChampionshipService(
            TeamChampionshipRepository championshipRepository,
            ChampionshipCategoryRepository categoryRepository,
            ChampionshipMatchFormatRepository matchFormatRepository,
            ChampionshipEventRepository eventRepository,
            TeamChampionshipPoolRepository poolRepository,
            ChampionshipRulesConfigRepository rulesConfigRepository,
            ChampionshipTeamRegistrationRepository teamRegistrationRepository,
            ChampionshipPlayerRegistrationRepository playerRegistrationRepository,
            AuctionConfigRepository auctionConfigRepository,
            AuctionCategoryConfigRepository auctionCategoryConfigRepository,
            FileStorageUtil fileStorageUtil) {
        this.championshipRepository = championshipRepository;
        this.categoryRepository = categoryRepository;
        this.matchFormatRepository = matchFormatRepository;
        this.eventRepository = eventRepository;
        this.poolRepository = poolRepository;
        this.rulesConfigRepository = rulesConfigRepository;
        this.teamRegistrationRepository = teamRegistrationRepository;
        this.playerRegistrationRepository = playerRegistrationRepository;
        this.auctionConfigRepository = auctionConfigRepository;
        this.auctionCategoryConfigRepository = auctionCategoryConfigRepository;
        this.fileStorageUtil = fileStorageUtil;
    }

    @Transactional
    public TeamChampionship createChampionship(CreateTeamChampionshipRequest request) {
        try {
            return createChampionship(request, null);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create championship", e);
        }
    }

    @Transactional
    public TeamChampionship createChampionship(CreateTeamChampionshipRequest request, MultipartFile poster) throws IOException {
        TeamChampionship championship = new TeamChampionship();
        championship.setName(request.getName());
        championship.setDescription(request.getDescription());
        championship.setSport(request.getSport() != null ? request.getSport() : "Badminton");
        championship.setStartDate(request.getStartDate());
        championship.setEndDate(request.getEndDate());
        championship.setRegistrationClosingDate(request.getRegistrationClosingDate());
        championship.setOrganizerId(request.getOrganizerId());
        if (request.getOrganizerUuid() != null) {
            championship.setOrganizerUuid(UUID.fromString(request.getOrganizerUuid()));
        }
        championship.setUserId(request.getUserId());
        if (request.getUserUuid() != null) {
            championship.setUserUuid(UUID.fromString(request.getUserUuid()));
        }
        championship.setVenue(request.getVenue());
        championship.setLocation(request.getLocation());
        championship.setMapLink(request.getMapLink());
        championship.setContactPhone(request.getContactPhone());

        // Handle Poster File Upload or direct URL
        if (poster != null && !poster.isEmpty()) {
            String fileName = fileStorageUtil.saveFileToDir(poster, posterUploadDir, "");
            championship.setPosterUrl("/" + posterUploadDir + "/" + fileName);
        } else if (request.getPosterUrl() != null && !request.getPosterUrl().isBlank()) {
            championship.setPosterUrl(request.getPosterUrl());
        }

        championship.setMaxTeams(request.getMaxTeams() != null ? request.getMaxTeams() : 8);
        championship.setTeamRegistrationFee(request.getTeamRegistrationFee() != null ? request.getTeamRegistrationFee() : 0.0);
        championship.setPlayerFeeMode(request.getPlayerFeeMode() != null ? request.getPlayerFeeMode() : "FREE");
        championship.setDefaultPlayerFee(request.getDefaultPlayerFee() != null ? request.getDefaultPlayerFee() : 0.0);
        championship.setAuctionMode(request.getAuctionMode() != null ? request.getAuctionMode() : "FULL_AUCTION");
        championship.setVisibility(request.getVisibility() != null ? request.getVisibility() : "PUBLIC");
        championship.setStage("REGISTRATION_OPEN");
        championship.setStatus("ACTIVE");

        TeamChampionship saved = championshipRepository.save(championship);

        // 1. Categories
        Map<String, ChampionshipCategory> categoryMap = new HashMap<>();
        if (request.getCategories() != null && !request.getCategories().isEmpty()) {
            int order = 1;
            for (ChampionshipCategoryDTO catDto : request.getCategories()) {
                ChampionshipCategory category = new ChampionshipCategory();
                category.setChampionshipId(saved.getChampionshipId());
                category.setChampionshipUuid(saved.getChampionshipUuid());
                category.setName(catDto.getName());
                category.setCode(catDto.getCode());
                category.setDescription(catDto.getDescription());
                category.setMaxPlayers(catDto.getMaxPlayers());
                category.setBasePrice(catDto.getBasePrice() != null ? catDto.getBasePrice() : 1000.0);
                category.setRegistrationFee(catDto.getRegistrationFee() != null ? catDto.getRegistrationFee() : 0.0);
                category.setDisplayOrder(catDto.getDisplayOrder() != null ? catDto.getDisplayOrder() : order++);
                category.setIsActive(catDto.getIsActive() != null ? catDto.getIsActive() : true);
                ChampionshipCategory savedCat = categoryRepository.save(category);
                categoryMap.put(savedCat.getName().toLowerCase().trim(), savedCat);
            }
        }

        // 2. Match Formats
        Map<String, ChampionshipMatchFormat> formatMap = new HashMap<>();
        if (request.getMatchFormats() != null && !request.getMatchFormats().isEmpty()) {
            int order = 1;
            for (ChampionshipMatchFormatDTO formatDto : request.getMatchFormats()) {
                ChampionshipMatchFormat format = new ChampionshipMatchFormat();
                format.setChampionshipId(saved.getChampionshipId());
                format.setChampionshipUuid(saved.getChampionshipUuid());
                format.setName(formatDto.getName());
                format.setSport(saved.getSport());
                format.setPlayersPerSide(formatDto.getPlayersPerSide() != null ? formatDto.getPlayersPerSide() : 2);
                format.setDisplayOrder(formatDto.getDisplayOrder() != null ? formatDto.getDisplayOrder() : order++);
                format.setIsActive(formatDto.getIsActive() != null ? formatDto.getIsActive() : true);
                ChampionshipMatchFormat savedFormat = matchFormatRepository.save(format);
                formatMap.put(savedFormat.getName().toLowerCase().trim(), savedFormat);
            }
        }

        // 3. Events (Combinations of Category + MatchFormat)
        if (request.getEvents() != null && !request.getEvents().isEmpty()) {
            int order = 1;
            for (ChampionshipEventDTO eventDto : request.getEvents()) {
                ChampionshipEvent event = new ChampionshipEvent();
                event.setChampionshipId(saved.getChampionshipId());
                event.setChampionshipUuid(saved.getChampionshipUuid());

                ChampionshipCategory cat = categoryMap.get(eventDto.getCategoryName() != null ? eventDto.getCategoryName().toLowerCase().trim() : "");
                Long catId = cat != null ? cat.getCategoryId() : (eventDto.getCategoryId() != null ? eventDto.getCategoryId() : 1L);
                event.setCategoryId(catId);
                event.setCategoryName(eventDto.getCategoryName() != null ? eventDto.getCategoryName() : "Open");

                ChampionshipMatchFormat fmt = formatMap.get(eventDto.getFormatName() != null ? eventDto.getFormatName().toLowerCase().trim() : "");
                Long fmtId = fmt != null ? fmt.getFormatId() : (eventDto.getFormatId() != null ? eventDto.getFormatId() : 1L);
                event.setFormatId(fmtId);
                event.setFormatName(eventDto.getFormatName() != null ? eventDto.getFormatName() : "Doubles");

                event.setEventName(eventDto.getEventName() != null ? eventDto.getEventName() : (event.getCategoryName() + " " + event.getFormatName()));
                event.setPointsWeight(eventDto.getPointsWeight() != null ? eventDto.getPointsWeight() : 1);
                event.setDisplayOrder(eventDto.getDisplayOrder() != null ? eventDto.getDisplayOrder() : order++);
                event.setIsMandatory(eventDto.getIsMandatory() != null ? eventDto.getIsMandatory() : true);
                event.setIsActive(true);
                eventRepository.save(event);
            }
        }

        // 4. Pools & Qualification (Step 8)
        if (request.getPools() != null && !request.getPools().isEmpty()) {
            for (ChampionshipPoolDTO poolDto : request.getPools()) {
                TeamChampionshipPool pool = new TeamChampionshipPool();
                pool.setChampionshipId(saved.getChampionshipId());
                pool.setChampionshipUuid(saved.getChampionshipUuid());
                pool.setPoolName(poolDto.getPoolName());
                pool.setStage(poolDto.getStage() != null ? poolDto.getStage() : "LEAGUE");
                pool.setQualifiersCount(poolDto.getQualifiersCount() != null ? poolDto.getQualifiersCount() : 2);
                poolRepository.save(pool);
            }
        }

        // 5. Rules Config (Step 9)
        ChampionshipRulesConfig rules = new ChampionshipRulesConfig();
        rules.setChampionshipId(saved.getChampionshipId());
        rules.setChampionshipUuid(saved.getChampionshipUuid());
        if (request.getRules() != null) {
            ChampionshipRulesDTO r = request.getRules();
            if (r.getMinSquadSize() != null) rules.setMinSquadSize(r.getMinSquadSize());
            if (r.getMaxSquadSize() != null) rules.setMaxSquadSize(r.getMaxSquadSize());
            if (r.getEveryPlayerMustPlayLeague() != null) rules.setEveryPlayerMustPlayLeague(r.getEveryPlayerMustPlayLeague());
            if (r.getAllowSubstitutions() != null) rules.setAllowSubstitutions(r.getAllowSubstitutions());

            // League Rules
            if (r.getLeagueMatchFormat() != null) rules.setLeagueMatchFormat(r.getLeagueMatchFormat());
            if (r.getLeagueWinPoints() != null) rules.setLeagueWinPoints(r.getLeagueWinPoints());
            if (r.getLeagueDrawPoints() != null) rules.setLeagueDrawPoints(r.getLeagueDrawPoints());
            if (r.getLeagueLossPoints() != null) rules.setLeagueLossPoints(r.getLeagueLossPoints());
            if (r.getLeagueLineupDeadlineMinutes() != null) rules.setLeagueLineupDeadlineMinutes(r.getLeagueLineupDeadlineMinutes());
            if (r.getLeagueTossOrderRule() != null) rules.setLeagueTossOrderRule(r.getLeagueTossOrderRule());
            if (r.getLeagueLineupRevealPolicy() != null) rules.setLeagueLineupRevealPolicy(r.getLeagueLineupRevealPolicy());
            if (r.getLeagueMaxSubstitutions() != null) rules.setLeagueMaxSubstitutions(r.getLeagueMaxSubstitutions());

            // Knockout Rules
            if (r.getKnockoutMatchFormat() != null) rules.setKnockoutMatchFormat(r.getKnockoutMatchFormat());
            if (r.getKnockoutLineupDeadlineMinutes() != null) rules.setKnockoutLineupDeadlineMinutes(r.getKnockoutLineupDeadlineMinutes());
            if (r.getKnockoutTossOrderRule() != null) rules.setKnockoutTossOrderRule(r.getKnockoutTossOrderRule());
            if (r.getKnockoutLineupRevealPolicy() != null) rules.setKnockoutLineupRevealPolicy(r.getKnockoutLineupRevealPolicy());
            if (r.getKnockoutMaxSubstitutions() != null) rules.setKnockoutMaxSubstitutions(r.getKnockoutMaxSubstitutions());

            // Legacy fallbacks
            if (r.getLineupDeadlineMinutes() != null) rules.setLineupDeadlineMinutes(r.getLineupDeadlineMinutes());
            if (r.getTossOrderRule() != null) rules.setTossOrderRule(r.getTossOrderRule());
            if (r.getLineupRevealPolicy() != null) rules.setLineupRevealPolicy(r.getLineupRevealPolicy());
            if (r.getMaxSubstitutionsPerFixture() != null) rules.setMaxSubstitutionsPerFixture(r.getMaxSubstitutionsPerFixture());
        }
        rulesConfigRepository.save(rules);

        // 6. Auction Configuration (if not NO_AUCTION)
        if (!"NO_AUCTION".equalsIgnoreCase(saved.getAuctionMode()) && request.getAuctionSetup() != null) {
            AuctionSetupDTO a = request.getAuctionSetup();
            AuctionConfig auctionConfig = new AuctionConfig();
            auctionConfig.setChampionshipId(saved.getChampionshipId());
            auctionConfig.setChampionshipUuid(saved.getChampionshipUuid());
            auctionConfig.setAuctionMode(a.getAuctionMode() != null ? a.getAuctionMode() : saved.getAuctionMode());
            auctionConfig.setCurrencyType(a.getCurrencyType() != null ? a.getCurrencyType() : "POINTS");
            auctionConfig.setCurrencySymbolOrLabel(a.getCurrencySymbolOrLabel() != null ? a.getCurrencySymbolOrLabel() : "pts");
            auctionConfig.setBasePriceStrategy(a.getBasePriceStrategy() != null ? a.getBasePriceStrategy() : "CATEGORY_BASED");
            auctionConfig.setDefaultBasePrice(a.getDefaultBasePrice() != null ? a.getDefaultBasePrice() : 1000.0);
            auctionConfig.setBidIncrement(a.getBidIncrement() != null ? a.getBidIncrement() : 500.0);
            auctionConfig.setTeamBudget(a.getTeamBudget() != null ? a.getTeamBudget() : 50000.0);
            auctionConfig.setReservedPlayersPerTeam(a.getReservedPlayersPerTeam() != null ? a.getReservedPlayersPerTeam() : 0);
            auctionConfig.setTimerSeconds(a.getTimerSeconds() != null ? a.getTimerSeconds() : 30);
            auctionConfig.setAntiSnipingSeconds(a.getAntiSnipingSeconds() != null ? a.getAntiSnipingSeconds() : 10);
            auctionConfig.setStatus("READY");

            AuctionConfig savedAuction = auctionConfigRepository.save(auctionConfig);

            // Save Category Base Prices if provided
            if (a.getCategoryBasePrices() != null) {
                for (AuctionSetupDTO.CategoryBasePriceDTO cbp : a.getCategoryBasePrices()) {
                    AuctionCategoryConfig acc = new AuctionCategoryConfig();
                    acc.setAuctionId(savedAuction.getAuctionId());
                    ChampionshipCategory cat = categoryMap.get(cbp.getCategoryName() != null ? cbp.getCategoryName().toLowerCase().trim() : "");
                    acc.setCategoryId(cat != null ? cat.getCategoryId() : (cbp.getCategoryId() != null ? cbp.getCategoryId() : 1L));
                    acc.setCategoryName(cbp.getCategoryName());
                    acc.setCategoryBasePrice(cbp.getBasePrice() != null ? cbp.getBasePrice() : 1000.0);
                    acc.setMinBidIncrement(cbp.getMinIncrement() != null ? cbp.getMinIncrement() : 500.0);
                    auctionCategoryConfigRepository.save(acc);
                }
            }
        }

        return saved;
    }

    public TeamChampionshipDetailDTO getChampionshipDetail(UUID championshipUuid) {
        TeamChampionship championship = championshipRepository.findByChampionshipUuid(championshipUuid)
                .orElseThrow(() -> new IllegalArgumentException("Team Championship not found for UUID: " + championshipUuid));

        TeamChampionshipDetailDTO dto = new TeamChampionshipDetailDTO();
        dto.setChampionshipId(championship.getChampionshipId());
        dto.setChampionshipUuid(championship.getChampionshipUuid());
        dto.setName(championship.getName());
        dto.setDescription(championship.getDescription());
        dto.setSport(championship.getSport());
        dto.setStartDate(championship.getStartDate());
        dto.setEndDate(championship.getEndDate());
        dto.setRegistrationClosingDate(championship.getRegistrationClosingDate());
        dto.setOrganizerId(championship.getOrganizerId());
        dto.setOrganizerUuid(championship.getOrganizerUuid());
        dto.setVenue(championship.getVenue());
        dto.setLocation(championship.getLocation());
        dto.setMapLink(championship.getMapLink());
        dto.setContactPhone(championship.getContactPhone());
        dto.setPosterUrl(championship.getPosterUrl());
        dto.setMaxTeams(championship.getMaxTeams());
        dto.setTeamRegistrationFee(championship.getTeamRegistrationFee());
        dto.setPlayerFeeMode(championship.getPlayerFeeMode());
        dto.setDefaultPlayerFee(championship.getDefaultPlayerFee());
        dto.setAuctionMode(championship.getAuctionMode());
        dto.setStage(championship.getStage());
        dto.setStatus(championship.getStatus());
        dto.setVisibility(championship.getVisibility());

        List<ChampionshipCategory> categories = categoryRepository.findByChampionshipIdOrderByDisplayOrderAsc(championship.getChampionshipId());
        Optional<AuctionConfig> auctionOpt = auctionConfigRepository.findByChampionshipId(championship.getChampionshipId());
        if (auctionOpt.isPresent()) {
            List<AuctionCategoryConfig> accList = auctionCategoryConfigRepository.findByAuctionId(auctionOpt.get().getAuctionId());
            Map<String, Double> basePriceMap = accList.stream().collect(Collectors.toMap(
                acc -> acc.getCategoryName() != null ? acc.getCategoryName().toLowerCase().trim() : "",
                AuctionCategoryConfig::getCategoryBasePrice,
                (existing, replacement) -> existing
            ));
            for (ChampionshipCategory cat : categories) {
                if ((cat.getBasePrice() == null || cat.getBasePrice() <= 0 || cat.getBasePrice() == 1000.0) && cat.getName() != null) {
                    Double bp = basePriceMap.get(cat.getName().toLowerCase().trim());
                    if (bp != null && bp > 0) {
                        cat.setBasePrice(bp);
                    }
                }
            }
        }
        dto.setCategories(categories);
        dto.setMatchFormats(matchFormatRepository.findByChampionshipIdOrderByDisplayOrderAsc(championship.getChampionshipId()));
        dto.setEvents(eventRepository.findByChampionshipIdOrderByDisplayOrderAsc(championship.getChampionshipId()));
        dto.setPools(poolRepository.findByChampionshipId(championship.getChampionshipId()));
        dto.setRules(rulesConfigRepository.findByChampionshipId(championship.getChampionshipId()).orElse(null));

        List<ChampionshipTeamRegistration> teams = teamRegistrationRepository.findByChampionshipId(championship.getChampionshipId());
        dto.setRegisteredTeamsCount(teams.size());

        List<ChampionshipPlayerRegistration> players = playerRegistrationRepository.findByChampionshipId(championship.getChampionshipId());
        dto.setRegisteredPlayersCount(players.size());

        return dto;
    }

    public List<TeamChampionship> getByOrganizer(UUID organizerUuid) {
        return championshipRepository.findByOrganizerUuid(organizerUuid);
    }

    public List<TeamChampionship> getAllPublic() {
        return championshipRepository.findByVisibility("PUBLIC");
    }

    @Transactional
    public TeamChampionship updateStage(UUID championshipUuid, String newStage) {
        TeamChampionship championship = championshipRepository.findByChampionshipUuid(championshipUuid)
                .orElseThrow(() -> new IllegalArgumentException("Championship not found"));
        championship.setStage(newStage);
        return championshipRepository.save(championship);
    }
}
