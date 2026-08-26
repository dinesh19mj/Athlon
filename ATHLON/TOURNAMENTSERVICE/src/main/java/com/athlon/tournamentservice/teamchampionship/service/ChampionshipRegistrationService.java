package com.athlon.tournamentservice.teamchampionship.service;

import com.athlon.tournamentservice.auction.entity.AuctionPlayer;
import com.athlon.tournamentservice.auction.entity.AuctionTeam;
import com.athlon.tournamentservice.auction.repository.AuctionPlayerRepository;
import com.athlon.tournamentservice.auction.repository.AuctionTeamRepository;
import com.athlon.tournamentservice.auction.entity.AuctionCategoryConfig;
import com.athlon.tournamentservice.auction.repository.AuctionCategoryConfigRepository;
import com.athlon.tournamentservice.auction.entity.AuctionConfig;
import com.athlon.tournamentservice.auction.repository.AuctionConfigRepository;
import com.athlon.tournamentservice.teamchampionship.dto.request.PlayerRegistrationRequest;
import com.athlon.tournamentservice.teamchampionship.dto.request.TeamRegistrationRequest;
import com.athlon.tournamentservice.teamchampionship.entity.*;
import com.athlon.tournamentservice.teamchampionship.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ChampionshipRegistrationService {

    private final TeamChampionshipRepository championshipRepository;
    private final ChampionshipTeamRegistrationRepository teamRegistrationRepository;
    private final ChampionshipPlayerRegistrationRepository playerRegistrationRepository;
    private final ChampionshipCategoryRepository categoryRepository;
    private final ChampionshipRulesConfigRepository rulesConfigRepository;
    private final ChampionshipSquadRepository squadRepository;
    private final AuctionConfigRepository auctionConfigRepository;
    private final AuctionCategoryConfigRepository auctionCategoryConfigRepository;
    private final AuctionTeamRepository auctionTeamRepository;
    private final AuctionPlayerRepository auctionPlayerRepository;

    @Autowired
    public ChampionshipRegistrationService(
            TeamChampionshipRepository championshipRepository,
            ChampionshipTeamRegistrationRepository teamRegistrationRepository,
            ChampionshipPlayerRegistrationRepository playerRegistrationRepository,
            ChampionshipCategoryRepository categoryRepository,
            ChampionshipRulesConfigRepository rulesConfigRepository,
            ChampionshipSquadRepository squadRepository,
            AuctionConfigRepository auctionConfigRepository,
            AuctionCategoryConfigRepository auctionCategoryConfigRepository,
            AuctionTeamRepository auctionTeamRepository,
            AuctionPlayerRepository auctionPlayerRepository) {
        this.championshipRepository = championshipRepository;
        this.teamRegistrationRepository = teamRegistrationRepository;
        this.playerRegistrationRepository = playerRegistrationRepository;
        this.categoryRepository = categoryRepository;
        this.rulesConfigRepository = rulesConfigRepository;
        this.squadRepository = squadRepository;
        this.auctionConfigRepository = auctionConfigRepository;
        this.auctionCategoryConfigRepository = auctionCategoryConfigRepository;
        this.auctionTeamRepository = auctionTeamRepository;
        this.auctionPlayerRepository = auctionPlayerRepository;
    }

    @Transactional
    public ChampionshipTeamRegistration registerTeam(TeamRegistrationRequest request) {
        TeamChampionship championship;
        if (request.getChampionshipUuid() != null) {
            championship = championshipRepository.findByChampionshipUuid(UUID.fromString(request.getChampionshipUuid()))
                    .orElseThrow(() -> new IllegalArgumentException("Championship not found"));
        } else if (request.getChampionshipId() != null) {
            championship = championshipRepository.findById(request.getChampionshipId())
                    .orElseThrow(() -> new IllegalArgumentException("Championship not found"));
        } else {
            throw new IllegalArgumentException("Championship reference required");
        }

        List<ChampionshipTeamRegistration> existing = teamRegistrationRepository.findByChampionshipId(championship.getChampionshipId());
        if (existing.size() >= championship.getMaxTeams()) {
            throw new IllegalStateException("Maximum teams capacity (" + championship.getMaxTeams() + ") reached for this championship");
        }

        ChampionshipTeamRegistration team = new ChampionshipTeamRegistration();
        team.setChampionshipId(championship.getChampionshipId());
        team.setChampionshipUuid(championship.getChampionshipUuid());
        team.setTeamName(request.getTeamName());
        team.setLogoUrl(request.getLogoUrl());
        team.setOwnerUserId(request.getOwnerUserId());
        if (request.getOwnerUserUuid() != null) {
            team.setOwnerUserUuid(UUID.fromString(request.getOwnerUserUuid()));
        }
        team.setCaptainName(request.getCaptainName());
        team.setContactPhone(request.getContactPhone());
        team.setContactEmail(request.getContactEmail());
        team.setStatus("APPROVED");
        team.setPaymentAmount(championship.getTeamRegistrationFee());
        team.setPaymentStatus(championship.getTeamRegistrationFee() > 0 ? "PENDING" : "PAID");

        ChampionshipTeamRegistration savedTeam = teamRegistrationRepository.save(team);

        // Auto-register team into AuctionTeam if auction config exists
        Optional<AuctionConfig> auctionConfigOpt = auctionConfigRepository.findByChampionshipId(championship.getChampionshipId());
        if (auctionConfigOpt.isPresent()) {
            AuctionConfig ac = auctionConfigOpt.get();
            AuctionTeam at = new AuctionTeam();
            at.setAuctionId(ac.getAuctionId());
            at.setAuctionUuid(ac.getAuctionUuid());
            at.setTeamId(savedTeam.getTeamId());
            at.setTeamUuid(savedTeam.getTeamUuid());
            at.setTeamName(savedTeam.getTeamName());
            at.setLogoUrl(savedTeam.getLogoUrl());
            at.setInitialBudget(ac.getTeamBudget());
            at.setRemainingBudget(ac.getTeamBudget());
            at.setSpentBudget(0.0);
            at.setSquadCapacity(rulesConfigRepository.findByChampionshipId(championship.getChampionshipId())
                    .map(ChampionshipRulesConfig::getMaxSquadSize).orElse(12));
            auctionTeamRepository.save(at);
        }

        return savedTeam;
    }

    @Transactional
    public ChampionshipPlayerRegistration registerPlayer(PlayerRegistrationRequest request) {
        TeamChampionship championship;
        if (request.getChampionshipUuid() != null) {
            championship = championshipRepository.findByChampionshipUuid(UUID.fromString(request.getChampionshipUuid()))
                    .orElseThrow(() -> new IllegalArgumentException("Championship not found"));
        } else if (request.getChampionshipId() != null) {
            championship = championshipRepository.findById(request.getChampionshipId())
                    .orElseThrow(() -> new IllegalArgumentException("Championship not found"));
        } else {
            throw new IllegalArgumentException("Championship reference required");
        }

        // Validate Category Player Quota (if configured)
        if (request.getCategoryId() != null) {
            Optional<ChampionshipCategory> catOpt = categoryRepository.findById(request.getCategoryId());
            if (catOpt.isPresent() && catOpt.get().getMaxPlayers() != null && catOpt.get().getMaxPlayers() > 0) {
                long currentCount = playerRegistrationRepository.findByChampionshipId(championship.getChampionshipId())
                        .stream()
                        .filter(p -> request.getCategoryId().equals(p.getCategoryId()))
                        .count();
                if (currentCount >= catOpt.get().getMaxPlayers()) {
                    throw new IllegalStateException("Registration quota full for category '" + catOpt.get().getName() + "'. Maximum " + catOpt.get().getMaxPlayers() + " players allowed.");
                }
            }
        }

        ChampionshipPlayerRegistration player = new ChampionshipPlayerRegistration();
        player.setChampionshipId(championship.getChampionshipId());
        player.setChampionshipUuid(championship.getChampionshipUuid());
        player.setUserId(request.getUserId());
        if (request.getUserUuid() != null) {
            player.setUserUuid(UUID.fromString(request.getUserUuid()));
        }
        player.setFullName(request.getFullName());
        player.setPhone(request.getPhone());
        player.setEmail(request.getEmail());
        player.setCategoryId(request.getCategoryId());
        player.setCategoryName(request.getCategoryName());
        if (request.getEligibleFormats() != null) {
            player.setEligibleFormats(String.join(", ", request.getEligibleFormats()));
        }
        // Resolve Category Base Price
        Double resolvedBasePrice = request.getBasePrice();
        if (resolvedBasePrice == null || resolvedBasePrice <= 0) {
            if (request.getCategoryId() != null) {
                Optional<ChampionshipCategory> catOpt = categoryRepository.findById(request.getCategoryId());
                if (catOpt.isPresent() && catOpt.get().getBasePrice() != null && catOpt.get().getBasePrice() > 0) {
                    resolvedBasePrice = catOpt.get().getBasePrice();
                }
            }
        }
        if (resolvedBasePrice == null || resolvedBasePrice <= 0) {
            Optional<AuctionConfig> auctionOpt = auctionConfigRepository.findByChampionshipId(championship.getChampionshipId());
            if (auctionOpt.isPresent() && request.getCategoryName() != null) {
                List<AuctionCategoryConfig> accList = auctionCategoryConfigRepository.findByAuctionId(auctionOpt.get().getAuctionId());
                for (AuctionCategoryConfig acc : accList) {
                    if (acc.getCategoryName() != null && acc.getCategoryName().equalsIgnoreCase(request.getCategoryName().trim())) {
                        resolvedBasePrice = acc.getCategoryBasePrice();
                        break;
                    }
                }
            }
        }

        player.setBasePrice(resolvedBasePrice != null && resolvedBasePrice > 0 ? resolvedBasePrice : 1000.0);
        player.setFeeAmount(request.getFeeAmount() != null ? request.getFeeAmount() : championship.getDefaultPlayerFee());
        player.setPaymentStatus(player.getFeeAmount() > 0 ? "PENDING" : "FREE");
        player.setStatus("APPROVED");
        player.setAvatarUrl(request.getAvatarUrl());

        ChampionshipPlayerRegistration savedPlayer = playerRegistrationRepository.save(player);

        // Auto-place player in Auction Pool if FULL_AUCTION or PARTIAL_AUCTION
        if ("FULL_AUCTION".equalsIgnoreCase(championship.getAuctionMode()) || "PARTIAL_AUCTION".equalsIgnoreCase(championship.getAuctionMode())) {
            Optional<AuctionConfig> auctionConfigOpt = auctionConfigRepository.findByChampionshipId(championship.getChampionshipId());
            if (auctionConfigOpt.isPresent()) {
                AuctionConfig ac = auctionConfigOpt.get();
                AuctionPlayer ap = new AuctionPlayer();
                ap.setAuctionId(ac.getAuctionId());
                ap.setAuctionUuid(ac.getAuctionUuid());
                ap.setPlayerId(savedPlayer.getPlayerId());
                ap.setPlayerUuid(savedPlayer.getPlayerUuid());
                ap.setPlayerName(savedPlayer.getFullName());
                ap.setCategoryId(savedPlayer.getCategoryId());
                ap.setCategoryName(savedPlayer.getCategoryName());
                ap.setEligibleFormats(savedPlayer.getEligibleFormats());
                ap.setBasePrice(savedPlayer.getBasePrice() != null && savedPlayer.getBasePrice() > 0 ? savedPlayer.getBasePrice() : ac.getDefaultBasePrice());
                ap.setState("WAITING");
                ap.setAvatarUrl(savedPlayer.getAvatarUrl());
                auctionPlayerRepository.save(ap);
            }
        }

        return savedPlayer;
    }

    public List<ChampionshipTeamRegistration> getTeamsByChampionship(UUID championshipUuid) {
        return teamRegistrationRepository.findByChampionshipUuid(championshipUuid);
    }

    public List<ChampionshipPlayerRegistration> getPlayersByChampionship(UUID championshipUuid) {
        List<ChampionshipPlayerRegistration> players = playerRegistrationRepository.findByChampionshipUuid(championshipUuid);
        if (players == null) return new ArrayList<>();
        Optional<TeamChampionship> champOpt = championshipRepository.findByChampionshipUuid(championshipUuid);
        if (champOpt.isPresent()) {
            List<ChampionshipCategory> categories = categoryRepository.findByChampionshipIdOrderByDisplayOrderAsc(champOpt.get().getChampionshipId());
            Optional<AuctionConfig> auctionOpt = auctionConfigRepository.findByChampionshipId(champOpt.get().getChampionshipId());
            List<AuctionCategoryConfig> accList = (auctionOpt.isPresent() && auctionOpt.get().getAuctionId() != null)
                    ? auctionCategoryConfigRepository.findByAuctionId(auctionOpt.get().getAuctionId())
                    : new ArrayList<>();

            for (ChampionshipPlayerRegistration p : players) {
                if (p == null) continue;
                Double catBasePrice = null;
                if (categories != null) {
                    for (ChampionshipCategory c : categories) {
                        if (c == null) continue;
                        if ((p.getCategoryId() != null && p.getCategoryId().equals(c.getCategoryId())) ||
                            (p.getCategoryName() != null && c.getName() != null && p.getCategoryName().equalsIgnoreCase(c.getName().trim()))) {
                            if (c.getBasePrice() != null && c.getBasePrice() > 0 && c.getBasePrice() != 1000.0) {
                                catBasePrice = c.getBasePrice();
                                break;
                            }
                        }
                    }
                }
                if (catBasePrice == null && accList != null) {
                    for (AuctionCategoryConfig acc : accList) {
                        if (acc == null) continue;
                        if (p.getCategoryName() != null && acc.getCategoryName() != null && p.getCategoryName().equalsIgnoreCase(acc.getCategoryName().trim())) {
                            if (acc.getCategoryBasePrice() != null && acc.getCategoryBasePrice() > 0) {
                                catBasePrice = acc.getCategoryBasePrice();
                                break;
                            }
                        }
                    }
                }
                if (catBasePrice != null && catBasePrice > 0) {
                    p.setBasePrice(catBasePrice);
                }
            }
        }
        return players;
    }

    public List<ChampionshipSquad> getTeamSquad(Long teamId) {
        return squadRepository.findByTeamId(teamId);
    }

    @Transactional
    public ChampionshipTeamRegistration updateTeamStatus(Long teamId, String status) {
        ChampionshipTeamRegistration team = teamRegistrationRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));
        team.setStatus(status);
        return teamRegistrationRepository.save(team);
    }

    @Transactional
    public ChampionshipPlayerRegistration updatePlayerStatus(Long playerId, String status) {
        ChampionshipPlayerRegistration player = playerRegistrationRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found"));
        player.setStatus(status);
        return playerRegistrationRepository.save(player);
    }

    @Transactional
    public ChampionshipTeamRegistration updateTeamPaymentStatus(Long teamId, String paymentStatus) {
        ChampionshipTeamRegistration team = teamRegistrationRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));
        team.setPaymentStatus(paymentStatus);
        return teamRegistrationRepository.save(team);
    }

    @Transactional
    public ChampionshipPlayerRegistration updatePlayerPaymentStatus(Long playerId, String paymentStatus) {
        ChampionshipPlayerRegistration player = playerRegistrationRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found"));
        player.setPaymentStatus(paymentStatus);
        return playerRegistrationRepository.save(player);
    }
}
