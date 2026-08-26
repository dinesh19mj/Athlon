package com.athlon.tournamentservice.auction.service;

import com.athlon.tournamentservice.auction.dto.request.AssignPlayerRequest;
import com.athlon.tournamentservice.auction.dto.request.CallPlayerRequest;
import com.athlon.tournamentservice.auction.dto.request.CreateAuctionConfigRequest;
import com.athlon.tournamentservice.auction.dto.request.SelectReservedPlayerRequest;
import com.athlon.tournamentservice.auction.dto.response.AuctionStateDTO;
import com.athlon.tournamentservice.auction.dto.response.AuctionTeamSummaryDTO;
import com.athlon.tournamentservice.auction.entity.*;
import com.athlon.tournamentservice.auction.repository.*;
import com.athlon.tournamentservice.teamchampionship.entity.ChampionshipPlayerRegistration;
import com.athlon.tournamentservice.teamchampionship.entity.ChampionshipSquad;
import com.athlon.tournamentservice.teamchampionship.repository.ChampionshipPlayerRegistrationRepository;
import com.athlon.tournamentservice.teamchampionship.repository.ChampionshipSquadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuctionEngineService {

    private final AuctionConfigRepository configRepository;
    private final AuctionCategoryConfigRepository categoryConfigRepository;
    private final AuctionPlayerRepository playerRepository;
    private final AuctionTeamRepository teamRepository;
    private final AuctionBidRepository bidRepository;
    private final AuctionReservedPlayerRepository reservedPlayerRepository;
    private final AuctionBudgetService budgetService;
    private final ChampionshipSquadRepository squadRepository;
    private final ChampionshipPlayerRegistrationRepository playerRegistrationRepository;

    @Autowired
    public AuctionEngineService(
            AuctionConfigRepository configRepository,
            AuctionCategoryConfigRepository categoryConfigRepository,
            AuctionPlayerRepository playerRepository,
            AuctionTeamRepository teamRepository,
            AuctionBidRepository bidRepository,
            AuctionReservedPlayerRepository reservedPlayerRepository,
            AuctionBudgetService budgetService,
            ChampionshipSquadRepository squadRepository,
            ChampionshipPlayerRegistrationRepository playerRegistrationRepository) {
        this.configRepository = configRepository;
        this.categoryConfigRepository = categoryConfigRepository;
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
        this.bidRepository = bidRepository;
        this.reservedPlayerRepository = reservedPlayerRepository;
        this.budgetService = budgetService;
        this.squadRepository = squadRepository;
        this.playerRegistrationRepository = playerRegistrationRepository;
    }

    @Transactional
    public AuctionConfig createOrUpdateAuctionConfig(CreateAuctionConfigRequest request) {
        AuctionConfig config = configRepository.findByChampionshipId(request.getChampionshipId())
                .orElse(new AuctionConfig());

        config.setChampionshipId(request.getChampionshipId());
        if (request.getChampionshipUuid() != null) {
            config.setChampionshipUuid(UUID.fromString(request.getChampionshipUuid()));
        }
        config.setAuctionMode(request.getAuctionMode() != null ? request.getAuctionMode() : "FULL_AUCTION");
        config.setCurrencyType(request.getCurrencyType() != null ? request.getCurrencyType() : "POINTS");
        config.setCurrencySymbolOrLabel(request.getCurrencySymbolOrLabel() != null ? request.getCurrencySymbolOrLabel() : "pts");
        config.setBasePriceStrategy(request.getBasePriceStrategy() != null ? request.getBasePriceStrategy() : "CATEGORY_BASED");
        config.setDefaultBasePrice(request.getDefaultBasePrice() != null ? request.getDefaultBasePrice() : 1000.0);
        config.setBidIncrement(request.getBidIncrement() != null ? request.getBidIncrement() : 500.0);
        config.setTeamBudget(request.getTeamBudget() != null ? request.getTeamBudget() : 50000.0);
        config.setReservedPlayersPerTeam(request.getReservedPlayersPerTeam() != null ? request.getReservedPlayersPerTeam() : 0);
        config.setTimerSeconds(request.getTimerSeconds() != null ? request.getTimerSeconds() : 30);
        config.setAntiSnipingSeconds(request.getAntiSnipingSeconds() != null ? request.getAntiSnipingSeconds() : 10);
        config.setStatus("READY");

        AuctionConfig saved = configRepository.save(config);

        if (request.getCategoryPrices() != null) {
            categoryConfigRepository.deleteByAuctionId(saved.getAuctionId());
            for (CreateAuctionConfigRequest.CategoryPriceItem item : request.getCategoryPrices()) {
                AuctionCategoryConfig acc = new AuctionCategoryConfig();
                acc.setAuctionId(saved.getAuctionId());
                acc.setCategoryId(item.getCategoryId());
                acc.setCategoryName(item.getCategoryName());
                acc.setCategoryBasePrice(item.getBasePrice() != null ? item.getBasePrice() : 1000.0);
                acc.setMinBidIncrement(item.getMinIncrement() != null ? item.getMinIncrement() : 500.0);
                categoryConfigRepository.save(acc);
            }
        }

        return saved;
    }

    @Transactional
    public AuctionStateDTO callPlayer(CallPlayerRequest request) {
        AuctionConfig config = configRepository.findById(request.getAuctionId())
                .orElseThrow(() -> new IllegalArgumentException("Auction not found"));

        AuctionPlayer player = playerRepository.findById(request.getAuctionPlayerId())
                .orElseThrow(() -> new IllegalArgumentException("Player not found in auction"));

        Double basePrice = player.getBasePrice();
        if (basePrice == null || basePrice <= 0 || basePrice == 1000.0) {
            List<AuctionCategoryConfig> accList = categoryConfigRepository.findByAuctionId(config.getAuctionId());
            for (AuctionCategoryConfig acc : accList) {
                if (player.getCategoryName() != null && acc.getCategoryName() != null &&
                    player.getCategoryName().equalsIgnoreCase(acc.getCategoryName().trim())) {
                    if (acc.getCategoryBasePrice() != null && acc.getCategoryBasePrice() > 0) {
                        basePrice = acc.getCategoryBasePrice();
                        player.setBasePrice(basePrice);
                        break;
                    }
                }
            }
        }

        config.setStatus("ACTIVE");
        config.setActivePlayerId(player.getAuctionPlayerId());
        config.setCurrentBid(basePrice != null ? basePrice : player.getBasePrice());
        config.setWinningTeamId(null);
        config.setTimerEndTime(LocalDateTime.now().plusSeconds(config.getTimerSeconds()));
        configRepository.save(config);

        player.setState("CALLED");
        player.setFinalBid(config.getCurrentBid());
        player.setWinningTeamId(null);
        player.setWinningTeamName(null);
        playerRepository.save(player);

        return getAuctionState(config.getAuctionId());
    }

    @Transactional
    public AuctionStateDTO markPlayerUnsold(Long auctionId, Long auctionPlayerId) {
        AuctionConfig config = configRepository.findById(auctionId)
                .orElseThrow(() -> new IllegalArgumentException("Auction not found"));

        AuctionPlayer player = playerRepository.findById(auctionPlayerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found"));

        player.setState("UNSOLD");
        player.setFinalBid(0.0);
        player.setWinningTeamId(null);
        player.setWinningTeamName(null);
        playerRepository.save(player);

        config.setActivePlayerId(null);
        config.setCurrentBid(0.0);
        config.setWinningTeamId(null);
        config.setTimerEndTime(null);
        configRepository.save(config);

        return getAuctionState(auctionId);
    }

    @Transactional
    public AuctionStateDTO confirmPlayerAssignment(AssignPlayerRequest request) {
        AuctionConfig config = configRepository.findById(request.getAuctionId())
                .orElseThrow(() -> new IllegalArgumentException("Auction not found"));

        AuctionPlayer player = playerRepository.findById(request.getAuctionPlayerId())
                .orElseThrow(() -> new IllegalArgumentException("Player not found"));

        AuctionTeam team = teamRepository.findByAuctionIdAndTeamId(config.getAuctionId(), request.getWinningTeamId())
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        Double price = request.getFinalBidAmount() != null ? request.getFinalBidAmount() : player.getFinalBid();

        // 1. Record budget deduction
        budgetService.recordTransaction(config.getAuctionId(), team.getTeamId(), "PURCHASE", price, player.getAuctionPlayerId(), "Acquired " + player.getPlayerName());

        // 2. Mark player as SOLD / ASSIGNED
        player.setState("ASSIGNED");
        player.setFinalBid(price);
        player.setWinningTeamId(team.getTeamId());
        player.setWinningTeamName(team.getTeamName());
        playerRepository.save(player);

        // 3. Create ChampionshipSquad member
        ChampionshipSquad squadPlayer = new ChampionshipSquad();
        squadPlayer.setChampionshipId(config.getChampionshipId());
        squadPlayer.setChampionshipUuid(config.getChampionshipUuid());
        squadPlayer.setTeamId(team.getTeamId());
        squadPlayer.setTeamUuid(team.getTeamUuid());
        squadPlayer.setPlayerId(player.getPlayerId());
        squadPlayer.setPlayerUuid(player.getPlayerUuid());
        squadPlayer.setPlayerName(player.getPlayerName());
        squadPlayer.setCategoryId(player.getCategoryId());
        squadPlayer.setCategoryName(player.getCategoryName());
        squadPlayer.setEligibleFormats(player.getEligibleFormats());
        squadPlayer.setAcquisitionType("AUCTION");
        squadPlayer.setPurchasePrice(price);
        squadRepository.save(squadPlayer);

        // 4. Update registration status
        playerRegistrationRepository.findById(player.getPlayerId()).ifPresent(pr -> {
            pr.setStatus("ASSIGNED");
            playerRegistrationRepository.save(pr);
        });

        // 5. Reset config active player
        config.setActivePlayerId(null);
        config.setCurrentBid(0.0);
        config.setWinningTeamId(null);
        config.setTimerEndTime(null);
        configRepository.save(config);

        return getAuctionState(config.getAuctionId());
    }

    @Transactional
    public AuctionReservedPlayer selectReservedPlayer(SelectReservedPlayerRequest request) {
        AuctionConfig config = configRepository.findByChampionshipId(request.getChampionshipId())
                .orElseThrow(() -> new IllegalArgumentException("Auction config not found"));

        if (!"PARTIAL_AUCTION".equalsIgnoreCase(config.getAuctionMode())) {
            throw new IllegalStateException("Reserved players only supported in PARTIAL_AUCTION mode");
        }

        AuctionTeam team = teamRepository.findByAuctionIdAndTeamId(config.getAuctionId(), request.getTeamId())
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        int currentReserved = reservedPlayerRepository.countByTeamId(team.getTeamId());
        if (currentReserved >= config.getReservedPlayersPerTeam()) {
            throw new IllegalStateException("Maximum reserved players limit (" + config.getReservedPlayersPerTeam() + ") reached for this team");
        }

        // Check if player is already reserved
        Optional<AuctionReservedPlayer> existing = reservedPlayerRepository.findByChampionshipIdAndPlayerId(request.getChampionshipId(), request.getPlayerId());
        if (existing.isPresent()) {
            throw new IllegalStateException("Player is already reserved by another team");
        }

        AuctionReservedPlayer reserved = new AuctionReservedPlayer();
        reserved.setAuctionId(config.getAuctionId());
        reserved.setChampionshipId(request.getChampionshipId());
        reserved.setTeamId(request.getTeamId());
        reserved.setPlayerId(request.getPlayerId());
        reserved.setPlayerName(request.getPlayerName());
        reserved.setCategoryId(request.getCategoryId());
        reserved.setCategoryName(request.getCategoryName());
        reserved.setIsLocked(true);

        AuctionReservedPlayer saved = reservedPlayerRepository.save(reserved);

        // Add to team squad
        ChampionshipSquad squad = new ChampionshipSquad();
        squad.setChampionshipId(request.getChampionshipId());
        squad.setChampionshipUuid(config.getChampionshipUuid());
        squad.setTeamId(team.getTeamId());
        squad.setTeamUuid(team.getTeamUuid());
        squad.setPlayerId(request.getPlayerId());
        squad.setPlayerName(request.getPlayerName());
        squad.setCategoryId(request.getCategoryId());
        squad.setCategoryName(request.getCategoryName());
        squad.setAcquisitionType("RESERVED");
        squad.setPurchasePrice(0.0);
        squadRepository.save(squad);

        // Update team reserved count
        team.setReservedSlotsCount(team.getReservedSlotsCount() + 1);
        teamRepository.save(team);

        // Remove from auction player pool if present
        playerRepository.findByAuctionIdAndPlayerId(config.getAuctionId(), request.getPlayerId()).ifPresent(ap -> {
            ap.setState("ASSIGNED");
            playerRepository.save(ap);
        });

        return saved;
    }

    public AuctionStateDTO getAuctionState(Long auctionId) {
        AuctionConfig config = configRepository.findById(auctionId)
                .orElseThrow(() -> new IllegalArgumentException("Auction not found"));

        AuctionStateDTO state = new AuctionStateDTO();
        state.setConfig(config);

        if (config.getActivePlayerId() != null) {
            playerRepository.findById(config.getActivePlayerId()).ifPresent(state::setActivePlayer);
        }

        state.setCurrentBid(config.getCurrentBid());
        state.setWinningTeamId(config.getWinningTeamId());
        if (config.getWinningTeamId() != null) {
            teamRepository.findByAuctionIdAndTeamId(config.getAuctionId(), config.getWinningTeamId())
                    .ifPresent(t -> state.setWinningTeamName(t.getTeamName()));
        }

        if (config.getTimerEndTime() != null) {
            long remaining = java.time.Duration.between(LocalDateTime.now(), config.getTimerEndTime()).getSeconds();
            state.setRemainingTimerSeconds((int) Math.max(0, remaining));
        } else {
            state.setRemainingTimerSeconds(0);
        }

        state.setTeams(teamRepository.findByAuctionId(auctionId));
        state.setRecentBids(bidRepository.findByAuctionIdOrderByCreatedAtDesc(auctionId).stream().limit(15).collect(Collectors.toList()));

        List<AuctionPlayer> allPlayers = playerRepository.findByAuctionId(auctionId);
        state.setTotalPlayersInPool(allPlayers.size());
        state.setSoldPlayersCount((int) allPlayers.stream().filter(p -> "ASSIGNED".equalsIgnoreCase(p.getState()) || "SOLD".equalsIgnoreCase(p.getState())).count());
        state.setUnsoldPlayersCount((int) allPlayers.stream().filter(p -> "UNSOLD".equalsIgnoreCase(p.getState())).count());

        return state;
    }

    public List<AuctionPlayer> getAuctionPlayers(Long auctionId) {
        List<AuctionPlayer> players = playerRepository.findByAuctionId(auctionId);
        List<AuctionCategoryConfig> accList = categoryConfigRepository.findByAuctionId(auctionId);
        for (AuctionPlayer p : players) {
            if (p.getBasePrice() == null || p.getBasePrice() <= 0 || p.getBasePrice() == 1000.0) {
                for (AuctionCategoryConfig acc : accList) {
                    if (p.getCategoryName() != null && acc.getCategoryName() != null &&
                        p.getCategoryName().equalsIgnoreCase(acc.getCategoryName().trim())) {
                        if (acc.getCategoryBasePrice() != null && acc.getCategoryBasePrice() > 0) {
                            p.setBasePrice(acc.getCategoryBasePrice());
                            break;
                        }
                    }
                }
            }
        }
        return players;
    }

    public List<AuctionTeamSummaryDTO> getAuctionTeams(Long auctionId) {
        List<AuctionTeam> teams = teamRepository.findByAuctionId(auctionId);
        return teams.stream().map(t -> {
            List<AuctionPlayer> players = playerRepository.findByAuctionIdAndWinningTeamId(auctionId, t.getTeamId());
            List<AuctionReservedPlayer> reserved = reservedPlayerRepository.findByTeamId(t.getTeamId());
            return new AuctionTeamSummaryDTO(t, players, reserved);
        }).collect(Collectors.toList());
    }
}
