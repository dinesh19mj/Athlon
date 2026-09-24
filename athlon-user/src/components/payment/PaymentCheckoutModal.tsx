'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Lock,
  Sparkles,
  IndianRupee,
  Building2,
  QrCode,
  Banknote,
  Copy,
  Check,
  Smartphone
} from 'lucide-react';
import {
  PaymentApi,
  PaymentPurpose,
  PaymentOrderDto,
  VerifyPaymentResult,
  OrganizationPaymentConfigDto,
  OfflinePaymentMethod,
  PaymentMode
} from '@/lib/api/payment';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  purpose: PaymentPurpose;
  referenceId: string;
  organizationId?: string;
  payerId?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  onSuccess: (result: any) => void;
  onFailure?: (errorMsg: string) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  purpose,
  referenceId,
  organizationId,
  payerId,
  payerName,
  payerEmail,
  payerPhone,
  onSuccess,
  onFailure,
}) => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submittingOffline, setSubmittingOffline] = useState(false);
  const [order, setOrder] = useState<PaymentOrderDto | null>(null);
  const [config, setConfig] = useState<OrganizationPaymentConfigDto | null>(null);
  const [activeTab, setActiveTab] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Offline form state
  const [offlineMethod, setOfflineMethod] = useState<OfflinePaymentMethod>('DIRECT_UPI');
  const [utrNumber, setUtrNumber] = useState('');
  const [payerNotes, setPayerNotes] = useState('');
  const [offlineSuccess, setOfflineSuccess] = useState(false);

  // Dynamically load Razorpay Checkout Script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setSdkReady(true);
      script.onerror = () => setErrorMessage('Failed to load secure Razorpay gateway.');
      document.body.appendChild(script);
    } else if (typeof window !== 'undefined' && window.Razorpay) {
      setSdkReady(true);
    }
  }, []);

  // Initialize Payment Order and Config when modal opens
  useEffect(() => {
    if (isOpen && referenceId) {
      setOfflineSuccess(false);
      initiateOrderAndConfig();
    } else {
      setOrder(null);
      setConfig(null);
      setErrorMessage(null);
      setVerifying(false);
      setLoading(false);
    }
  }, [isOpen, referenceId, purpose, organizationId]);

  const initiateOrderAndConfig = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // Create online order
      const orderPromise = PaymentApi.createOrder({
        purpose,
        referenceId,
        payerName,
        payerEmail,
        payerPhone,
      });

      // Fetch org payment config if orgId available
      const configPromise = organizationId ? PaymentApi.getPaymentConfig(organizationId) : Promise.resolve(null);

      const [orderRes, configRes] = await Promise.all([orderPromise, configPromise]);

      if (orderRes?.success && orderRes.data) {
        setOrder(orderRes.data);
      }

      if (configRes?.success && configRes.data) {
        const c = configRes.data;
        setConfig(c);
        if (c.defaultPaymentMode === 'OFFLINE_ONLY') {
          setActiveTab('OFFLINE');
        } else {
          setActiveTab('ONLINE');
        }
      }
    } catch (err: any) {
      console.error('Payment order creation error:', err);
      const msg = err?.data?.message || err?.message || 'Failed to prepare payment order.';
      setErrorMessage(msg);
      if (onFailure) onFailure(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUpi = (upi: string) => {
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleLaunchRazorpay = () => {
    if (!order) return;

    if (!window.Razorpay) {
      setErrorMessage('Payment Gateway SDK is still initializing. Please wait a moment.');
      return;
    }

    const options = {
      key: order.razorpayKeyId,
      amount: order.amount * 100, // paise
      currency: order.currency || 'INR',
      name: 'ATHLON Sports',
      description: order.businessTitle || order.description || 'Sports Transaction',
      order_id: order.providerOrderId,
      image: '/icons/icon-192x192.png',
      prefill: {
        name: payerName || order.payerName || '',
        email: payerEmail || order.payerEmail || '',
        contact: payerPhone || order.payerPhone || '',
      },
      theme: {
        color: '#54AC68', // Athlon brand green
      },
      modal: {
        ondismiss: function () {
          console.log('Checkout window dismissed by user.');
        },
      },
      handler: async function (response: any) {
        setVerifying(true);
        try {
          const verifyRes = await PaymentApi.verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (verifyRes?.success && verifyRes.data?.verified) {
            onSuccess(verifyRes.data);
            onClose();
          } else {
            throw new Error(verifyRes?.data?.message || 'Payment signature verification failed.');
          }
        } catch (vErr: any) {
          console.error('Server payment verification error:', vErr);
          const vMsg = vErr?.data?.message || vErr?.message || 'Payment verification failed.';
          setErrorMessage(vMsg);
          if (onFailure) onFailure(vMsg);
        } finally {
          setVerifying(false);
        }
      },
    };

    try {
      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (resp: any) {
        const fReason = resp?.error?.description || 'Transaction was declined by issuing bank.';
        setErrorMessage(fReason);
      });
      rzpInstance.open();
    } catch (e: any) {
      console.error('Failed to open Razorpay gateway:', e);
      setErrorMessage('Could not open payment window: ' + e.message);
    }
  };

  const handleSubmitOfflinePayment = async () => {
    if (!order) return;
    try {
      setSubmittingOffline(true);
      setErrorMessage(null);

      const targetOrgId = organizationId || '00000000-0000-0000-0000-000000000000';
      const targetPayerId = payerId || '00000000-0000-0000-0000-000000000000';

      const res = await PaymentApi.submitOfflinePayment({
        organizationId: targetOrgId,
        purpose,
        entityId: referenceId,
        entityName: order.businessTitle,
        payerId: targetPayerId,
        payerName: payerName || order.payerName,
        payerEmail: payerEmail || order.payerEmail,
        payerPhone: payerPhone || order.payerPhone,
        amount: order.amount,
        currency: order.currency || 'INR',
        paymentMethod: offlineMethod,
        utrNumber: utrNumber.trim() || undefined,
        payerNotes: payerNotes.trim() || undefined,
      });

      if (res?.success && res.data) {
        setOfflineSuccess(true);
        setTimeout(() => {
          onSuccess(res.data);
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Offline payment submission error:', err);
      setErrorMessage(err?.data?.message || err?.message || 'Failed to submit offline payment.');
    } finally {
      setSubmittingOffline(false);
    }
  };

  if (!isOpen) return null;

  const mode = config?.defaultPaymentMode || 'BOTH';
  const showTabs = mode === 'BOTH';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card border border-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-surface/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">ATHLON Checkout</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Secure &amp; Encrypted
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={verifying || submittingOffline}
            className="p-1.5 rounded-xl text-foreground/40 hover:text-foreground hover:bg-surface transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation if BOTH modes allowed */}
        {showTabs && !loading && !verifying && !offlineSuccess && (
          <div className="flex border-b border-border bg-surface/20 p-1.5 gap-1.5">
            <button
              onClick={() => setActiveTab('ONLINE')}
              className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ONLINE'
                  ? 'bg-primary text-black shadow-sm'
                  : 'text-text-muted hover:text-foreground hover:bg-surface/50'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay Online</span>
            </button>
            <button
              onClick={() => setActiveTab('OFFLINE')}
              className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'OFFLINE'
                  ? 'bg-primary text-black shadow-sm'
                  : 'text-text-muted hover:text-foreground hover:bg-surface/50'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Pay Offline / Desk</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-bold text-foreground">Calculating authoritative price &amp; payee details...</p>
              <span className="text-[10px] text-text-muted">Direct server-side verification</span>
            </div>
          ) : verifying ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in">
              <div className="relative">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <Sparkles className="w-4 h-4 text-emerald-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <p className="text-sm font-extrabold text-foreground">Verifying with Bank &amp; Finalizing Entry...</p>
              <span className="text-xs text-text-muted">Please do not refresh or press back.</span>
            </div>
          ) : offlineSuccess ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-foreground">Offline Payment Recorded!</h4>
              <p className="text-xs text-text-muted max-w-xs leading-relaxed">
                Your entry has been submitted. The organizer will verify your payment / collect cash at the desk.
              </p>
            </div>
          ) : errorMessage ? (
            <div className="py-4 space-y-4">
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-500">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold">Payment Error</p>
                  <p className="text-[11px] leading-relaxed opacity-90">{errorMessage}</p>
                </div>
              </div>
              <button
                onClick={initiateOrderAndConfig}
                className="w-full py-3 rounded-xl bg-surface border border-border text-foreground text-xs font-bold hover:bg-surface/80 transition-all"
              >
                Retry Preparation
              </button>
            </div>
          ) : order ? (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    Item / Event
                  </span>
                  <span className="text-xs font-extrabold text-foreground truncate max-w-[220px]">
                    {order.businessTitle}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    Total Payable Amount
                  </span>
                  <div className="flex items-center text-xl font-black text-primary">
                    <IndianRupee className="w-4 h-4 mr-0.5" />
                    <span>{order.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* TAB 1: ONLINE CHECKOUT */}
              {activeTab === 'ONLINE' && (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Instant Confirmation: UPI (GPay/PhonePe), Cards &amp; NetBanking</span>
                  </div>

                  <button
                    onClick={handleLaunchRazorpay}
                    disabled={!sdkReady}
                    className="w-full py-3.5 px-4 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>Proceed to Pay ₹{order.amount.toFixed(2)}</span>
                  </button>
                </div>
              )}

              {/* TAB 2: OFFLINE PAYMENT / AT VENUE */}
              {activeTab === 'OFFLINE' && (
                <div className="space-y-4 pt-1">
                  {/* Offline instructions from Organizer */}
                  {config?.offlineInstructions && (
                    <div className="p-3.5 rounded-xl bg-surface border border-border text-xs text-foreground/90 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
                        Organizer Instructions:
                      </span>
                      <p className="leading-relaxed font-medium">{config.offlineInstructions}</p>
                    </div>
                  )}

                  {/* Direct UPI details if available */}
                  {config?.offlineUpiId && (
                    <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-text-muted uppercase">Direct UPI ID</span>
                        <p className="font-mono text-xs font-bold text-foreground">{config.offlineUpiId}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyUpi(config.offlineUpiId!)}
                        className="p-2 rounded-lg bg-surface border border-border hover:bg-surface/80 text-foreground/70 hover:text-foreground text-xs flex items-center gap-1 font-bold"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}

                  {/* Payment Method Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-foreground">Choose Offline Method:</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setOfflineMethod('DIRECT_UPI')}
                        className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                          offlineMethod === 'DIRECT_UPI'
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-surface border-border text-text-muted'
                        }`}
                      >
                        Direct UPI
                      </button>
                      <button
                        type="button"
                        onClick={() => setOfflineMethod('CASH_AT_VENUE')}
                        className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                          offlineMethod === 'CASH_AT_VENUE'
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-surface border-border text-text-muted'
                        }`}
                      >
                        Cash at Desk
                      </button>
                      <button
                        type="button"
                        onClick={() => setOfflineMethod('BANK_TRANSFER')}
                        className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                          offlineMethod === 'BANK_TRANSFER'
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-surface border-border text-text-muted'
                        }`}
                      >
                        Bank Transfer
                      </button>
                    </div>
                  </div>

                  {/* UTR / Reference ID if UPI/Bank */}
                  {offlineMethod !== 'CASH_AT_VENUE' && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-foreground">
                        Transaction Reference / UTR Number
                      </label>
                      <input
                        type="text"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="e.g. 423987123456"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}

                  {/* Additional notes */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground">
                      Note to Organizer (Optional)
                    </label>
                    <input
                      type="text"
                      value={payerNotes}
                      onChange={(e) => setPayerNotes(e.target.value)}
                      placeholder="e.g. Aryan batch fee / Paid via GPay Aryan Singh"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitOfflinePayment}
                    disabled={submittingOffline}
                    className="w-full py-3.5 px-4 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submittingOffline ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Entry...</span>
                      </>
                    ) : (
                      <span>
                        {offlineMethod === 'CASH_AT_VENUE'
                          ? 'Confirm & Pay at Venue Desk'
                          : 'Submit Offline Payment Details'}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
