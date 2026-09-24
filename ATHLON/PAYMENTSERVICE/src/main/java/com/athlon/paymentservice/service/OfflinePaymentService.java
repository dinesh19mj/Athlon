package com.athlon.paymentservice.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.paymentservice.business.PaymentBusinessHandler;
import com.athlon.paymentservice.business.PaymentBusinessHandlerRegistry;
import com.athlon.paymentservice.dto.OfflinePaymentResponse;
import com.athlon.paymentservice.dto.OfflinePaymentSubmitRequest;
import com.athlon.paymentservice.dto.OfflinePaymentVerifyRequest;
import com.athlon.paymentservice.entity.OfflinePaymentRecord;
import com.athlon.paymentservice.entity.PaymentOrder;
import com.athlon.paymentservice.entity.PaymentTransaction;
import com.athlon.paymentservice.enums.OfflinePaymentStatus;
import com.athlon.paymentservice.enums.PaymentPurpose;
import com.athlon.paymentservice.enums.PaymentStatus;
import com.athlon.paymentservice.repository.OfflinePaymentRecordRepository;

@Service
public class OfflinePaymentService {

    private static final Logger log = LoggerFactory.getLogger(OfflinePaymentService.class);

    private final OfflinePaymentRecordRepository recordRepository;
    private final PaymentBusinessHandlerRegistry handlerRegistry;

    public OfflinePaymentService(
            OfflinePaymentRecordRepository recordRepository,
            PaymentBusinessHandlerRegistry handlerRegistry
    ) {
        this.recordRepository = recordRepository;
        this.handlerRegistry = handlerRegistry;
    }

    /**
     * Payer submits offline payment details (or marks pay at desk).
     */
    @Transactional
    public OfflinePaymentResponse submitOfflinePayment(OfflinePaymentSubmitRequest req) {
        log.info("Payer {} submitting offline payment for org: {}, purpose: {}, entity: {}",
                req.getPayerId(), req.getOrganizationId(), req.getPurpose(), req.getEntityId());

        OfflinePaymentRecord record = recordRepository
                .findByEntityIdAndPurposeAndPayerId(req.getEntityId(), req.getPurpose(), req.getPayerId())
                .orElseGet(OfflinePaymentRecord::new);

        record.setOrganizationId(req.getOrganizationId());
        record.setPurpose(req.getPurpose());
        record.setEntityId(req.getEntityId());
        record.setEntityName(req.getEntityName());
        record.setPayerId(req.getPayerId());
        record.setPayerName(req.getPayerName());
        record.setPayerEmail(req.getPayerEmail());
        record.setPayerPhone(req.getPayerPhone());
        record.setAmount(req.getAmount());
        record.setCurrency(req.getCurrency() != null ? req.getCurrency() : "INR");
        record.setPaymentMethod(req.getPaymentMethod());
        record.setUtrNumber(req.getUtrNumber());
        record.setReceiptUrl(req.getReceiptUrl());
        record.setPayerNotes(req.getPayerNotes());
        record.setStatus(OfflinePaymentStatus.PENDING_VERIFICATION);

        OfflinePaymentRecord saved = recordRepository.save(record);
        return OfflinePaymentResponse.fromEntity(saved);
    }

    /**
     * Staff verifies, collects cash at desk, or rejects offline payment.
     */
    @Transactional
    public OfflinePaymentResponse verifyOfflinePayment(OfflinePaymentVerifyRequest req) {
        log.info("Staff {} updating offline payment record {} to status: {}",
                req.getStaffId(), req.getRecordId(), req.getStatus());

        OfflinePaymentRecord record = recordRepository.findById(req.getRecordId())
                .orElseThrow(() -> new IllegalArgumentException("Offline payment record not found: " + req.getRecordId()));

        record.setStatus(req.getStatus());
        record.setVerifiedByStaffId(req.getStaffId());
        record.setVerifiedByStaffName(req.getStaffName());
        record.setVerifiedAt(LocalDateTime.now());
        record.setStaffReceiptNumber(req.getStaffReceiptNumber());
        record.setStaffNotes(req.getStaffNotes());

        if (req.getStatus() == OfflinePaymentStatus.REJECTED) {
            record.setRejectionReason(req.getRejectionReason());
        }

        OfflinePaymentRecord saved = recordRepository.save(record);

        // If verified or collected at desk, notify downstream business handler
        if (req.getStatus() == OfflinePaymentStatus.VERIFIED || req.getStatus() == OfflinePaymentStatus.COLLECTED_AT_DESK) {
            notifyBusinessHandler(saved);
        }

        return OfflinePaymentResponse.fromEntity(saved);
    }

    private void notifyBusinessHandler(OfflinePaymentRecord record) {
        try {
            PaymentBusinessHandler handler = handlerRegistry.getHandler(record.getPurpose());
            PaymentOrder dummyOrder = new PaymentOrder();
            dummyOrder.setPayeeRecipientId(record.getOrganizationId());
            dummyOrder.setPurpose(record.getPurpose());
            dummyOrder.setReferenceType(record.getPurpose().name());
            dummyOrder.setReferenceId(record.getEntityId().toString());
            dummyOrder.setPayerUserUuid(record.getPayerId());
            dummyOrder.setPayerUserId(record.getPayerId().toString());
            dummyOrder.setAmount(record.getAmount());
            dummyOrder.setCurrency(record.getCurrency());
            dummyOrder.setStatus(PaymentStatus.PAID);
            dummyOrder.setPaymentNumber("OFFLINE-" + record.getId().toString().substring(0, 8).toUpperCase());

            PaymentTransaction dummyTx = new PaymentTransaction();
            dummyTx.setAmount(record.getAmount());
            dummyTx.setPaymentOrder(dummyOrder);
            dummyTx.setPaymentMethod(record.getPaymentMethod().name());
            dummyTx.setStatus("CAPTURED");
            dummyTx.setSignatureVerified(true);
            dummyTx.setCapturedAt(record.getVerifiedAt() != null ? record.getVerifiedAt() : LocalDateTime.now());
            dummyTx.setProviderPaymentId(record.getUtrNumber() != null ? record.getUtrNumber() : "OFFLINE-DESK");

            handler.onPaymentConfirmed(dummyOrder, dummyTx);
            log.info("Successfully notified business handler for offline record: {}", record.getId());
        } catch (Exception e) {
            log.warn("Could not notify business handler for offline record {}: {}", record.getId(), e.getMessage());
        }
    }

    public List<OfflinePaymentResponse> getRecordsForOrganization(UUID orgId, OfflinePaymentStatus status) {
        List<OfflinePaymentRecord> records = (status != null)
                ? recordRepository.findByOrganizationIdAndStatusOrderByCreatedAtDesc(orgId, status)
                : recordRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId);

        return records.stream().map(OfflinePaymentResponse::fromEntity).collect(Collectors.toList());
    }

    public List<OfflinePaymentResponse> getRecordsForEntity(UUID entityId, PaymentPurpose purpose) {
        return recordRepository.findByEntityIdAndPurposeOrderByCreatedAtDesc(entityId, purpose)
                .stream().map(OfflinePaymentResponse::fromEntity).collect(Collectors.toList());
    }

    public List<OfflinePaymentResponse> getRecordsForPayer(UUID payerId) {
        return recordRepository.findByPayerIdOrderByCreatedAtDesc(payerId)
                .stream().map(OfflinePaymentResponse::fromEntity).collect(Collectors.toList());
    }
}
