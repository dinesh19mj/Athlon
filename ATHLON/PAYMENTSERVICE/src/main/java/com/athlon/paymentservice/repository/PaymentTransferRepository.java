package com.athlon.paymentservice.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.paymentservice.entity.PaymentOrder;
import com.athlon.paymentservice.entity.PaymentTransfer;
import com.athlon.paymentservice.enums.TransferStatus;

@Repository
public interface PaymentTransferRepository extends JpaRepository<PaymentTransfer, UUID> {

    Optional<PaymentTransfer> findByProviderTransferId(String providerTransferId);

    List<PaymentTransfer> findByPaymentOrder(PaymentOrder paymentOrder);

    List<PaymentTransfer> findByRecipientAccountIdAndStatus(String recipientAccountId, TransferStatus status);
}
