package com.athlon.tournamentservice.auction.service;

import com.athlon.tournamentservice.auction.entity.AuctionBudgetTransaction;
import com.athlon.tournamentservice.auction.entity.AuctionTeam;
import com.athlon.tournamentservice.auction.repository.AuctionBudgetTransactionRepository;
import com.athlon.tournamentservice.auction.repository.AuctionTeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuctionBudgetService {

    private final AuctionBudgetTransactionRepository transactionRepository;
    private final AuctionTeamRepository teamRepository;

    @Autowired
    public AuctionBudgetService(AuctionBudgetTransactionRepository transactionRepository, AuctionTeamRepository teamRepository) {
        this.transactionRepository = transactionRepository;
        this.teamRepository = teamRepository;
    }

    @Transactional
    public AuctionBudgetTransaction recordTransaction(Long auctionId, Long teamId, String type, Double amount, Long referenceId, String note) {
        AuctionTeam team = teamRepository.findByAuctionIdAndTeamId(auctionId, teamId)
                .orElseThrow(() -> new IllegalArgumentException("Auction Team not found for auction: " + auctionId + ", team: " + teamId));

        Double before = team.getRemainingBudget();
        Double after;

        if ("PURCHASE".equalsIgnoreCase(type)) {
            if (before < amount) {
                throw new IllegalStateException("Insufficient budget: remaining " + before + ", required " + amount);
            }
            after = before - amount;
            team.setSpentBudget(team.getSpentBudget() + amount);
            team.setRemainingBudget(after);
            team.setPlayersAcquiredCount(team.getPlayersAcquiredCount() + 1);
        } else if ("REFUND".equalsIgnoreCase(type)) {
            after = before + amount;
            team.setSpentBudget(Math.max(0.0, team.getSpentBudget() - amount));
            team.setRemainingBudget(after);
            team.setPlayersAcquiredCount(Math.max(0, team.getPlayersAcquiredCount() - 1));
        } else if ("ADJUSTMENT".equalsIgnoreCase(type)) {
            after = before + amount;
            team.setRemainingBudget(after);
        } else {
            after = before;
        }

        teamRepository.save(team);

        AuctionBudgetTransaction tx = new AuctionBudgetTransaction();
        tx.setAuctionId(auctionId);
        tx.setTeamId(teamId);
        tx.setType(type);
        tx.setAmount(amount);
        tx.setBalanceBefore(before);
        tx.setBalanceAfter(after);
        tx.setReferenceId(referenceId);
        tx.setNote(note);

        return transactionRepository.save(tx);
    }

    public List<AuctionBudgetTransaction> getTeamTransactions(Long auctionId, Long teamId) {
        return transactionRepository.findByAuctionIdAndTeamIdOrderByCreatedAtDesc(auctionId, teamId);
    }

    public List<AuctionBudgetTransaction> getAuctionTransactions(Long auctionId) {
        return transactionRepository.findByAuctionIdOrderByCreatedAtDesc(auctionId);
    }
}
