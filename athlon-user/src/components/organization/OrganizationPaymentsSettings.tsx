import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  Zap,
  Loader2,
  RefreshCw,
  Power,
  Lock,
  QrCode,
  Banknote,
  Save,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  Layers,
  Landmark,
  Smartphone,
  Eye,
  EyeOff,
  User,
  Hash,
  ArrowRight,
  Shield
} from 'lucide-react';
import {
  PaymentApi,
  OrganizationPaymentConfigDto,
  PaymentMode
} from '@/lib/api/payment';

interface OrganizationPaymentsSettingsProps {
  organizationId: string;
  organizationName: string;
  organizationType: string;
}

export const OrganizationPaymentsSettings: React.FC<OrganizationPaymentsSettingsProps> = ({
  organizationId,
  organizationName,
  organizationType,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [config, setConfig] = useState<OrganizationPaymentConfigDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('BOTH');
  const [offlineUpiId, setOfflineUpiId] = useState('');
  const [offlineUpiQrUrl, setOfflineUpiQrUrl] = useState('');
  const [offlineAccountHolder, setOfflineAccountHolder] = useState('');
  const [offlineAccountNumber, setOfflineAccountNumber] = useState('');
  const [offlineIfscCode, setOfflineIfscCode] = useState('');
  const [offlineBankName, setOfflineBankName] = useState('');
  const [offlineInstructions, setOfflineInstructions] = useState('');
  const [offlineCashAllowed, setOfflineCashAllowed] = useState(true);
  const [offlineUpiAllowed, setOfflineUpiAllowed] = useState(true);
  const [offlineBankTransferAllowed, setOfflineBankTransferAllowed] = useState(true);

  // UI Interactive state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPlayerPreview, setShowPlayerPreview] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await PaymentApi.getPaymentConfig(organizationId);
      if (res?.success && res.data) {
        const d = res.data;
        setConfig(d);
        setPaymentMode(d.defaultPaymentMode || 'BOTH');
        setOfflineUpiId(d.offlineUpiId || '');
        setOfflineUpiQrUrl(d.offlineUpiQrUrl || '');
        setOfflineAccountHolder(d.offlineAccountHolder || '');
        setOfflineAccountNumber(d.offlineAccountNumber || '');
        setOfflineIfscCode(d.offlineIfscCode || '');
        setOfflineBankName(d.offlineBankName || '');
        setOfflineInstructions(d.offlineInstructions || '');
        setOfflineCashAllowed(d.offlineCashAllowed !== false);
        setOfflineUpiAllowed(d.offlineUpiAllowed !== false);
        setOfflineBankTransferAllowed(d.offlineBankTransferAllowed !== false);
      }
    } catch (err: any) {
      console.error('Failed to load payment configuration:', err);
      setErrorMessage(err?.data?.message || err?.message || 'Could not load payment settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchConfig();
    }
  }, [organizationId]);

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const payload: Partial<OrganizationPaymentConfigDto> = {
        defaultPaymentMode: paymentMode,
        offlineUpiId,
        offlineUpiQrUrl,
        offlineAccountHolder,
        offlineAccountNumber,
        offlineIfscCode,
        offlineBankName,
        offlineInstructions,
        offlineCashAllowed,
        offlineUpiAllowed,
        offlineBankTransferAllowed,
        businessName: organizationName,
        recipientType: organizationType,
      };

      const res = await PaymentApi.updatePaymentConfig(organizationId, payload);
      if (res?.success && res.data) {
        setConfig(res.data);
        setSuccessMessage('Payment settings saved successfully!');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Failed to save payment settings:', err);
      setErrorMessage(err?.data?.message || err?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleEnableOnlinePayments = async () => {
    try {
      setEnabling(true);
      setErrorMessage(null);
      const res = await PaymentApi.startOnboarding({
        organizationId,
        recipientType: organizationType,
        businessName: organizationName,
      });

      if (res?.success && res.data) {
        await fetchConfig();
        setSuccessMessage('Online payment capability initialized with Razorpay Route!');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Error starting payment onboarding:', err);
      setErrorMessage(err?.data?.message || err?.message || 'Failed to initialize online payments.');
    } finally {
      setEnabling(false);
    }
  };

  const handleTogglePayments = async () => {
    if (!config) return;
    try {
      setToggling(true);
      const newEnabled = !config.paymentsEnabled;
      const res = await PaymentApi.togglePaymentsEnabled(organizationId, newEnabled);
      if (res?.success && res.data) {
        setConfig((prev) => prev ? { ...prev, paymentsEnabled: newEnabled } : null);
      }
    } catch (err: any) {
      console.error('Error toggling payment status:', err);
      setErrorMessage(err?.data?.message || err?.message || 'Could not update payment status.');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-card/80 backdrop-blur-md border border-border/80 flex flex-col items-center justify-center text-center space-y-4 shadow-sm animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black text-foreground">Loading Payment Configuration</p>
          <p className="text-xs text-foreground/50">Fetching settlement gateways and credentials...</p>
        </div>
      </div>
    );
  }

  const isOnlineActive = config && (config.onlineOnboardingStatus === 'ACTIVE' || config.onlineOnboardingStatus === 'UNDER_REVIEW');

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl pb-16 sm:pb-6">
      {/* ── 1. Top Hero Card (Fintech Style) ── */}
      <div className="relative overflow-hidden rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-card via-card to-primary/[0.05] border border-border/80 shadow-sm">
        {/* Ambient background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0 shadow-xs">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Payments &amp; Settlements
                </span>
                <span className="px-2 py-0.5 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/75 text-[10px] font-extrabold uppercase">
                  {paymentMode === 'BOTH' ? 'Hybrid Mode' : paymentMode === 'OFFLINE_ONLY' ? 'Spot / UPI' : 'Online Only'}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-foreground tracking-tight">
                Universal Payment Gateway
              </h2>
              <p className="text-xs text-foreground/60 font-medium leading-relaxed max-w-xl">
                Accept online registrations via Razorpay, collect spot cash at venue desk, or share direct UPI &amp; bank details.
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 pt-1 sm:pt-0 self-end sm:self-auto shrink-0">
            <button
              onClick={fetchConfig}
              disabled={loading}
              title="Refresh credentials from server"
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-border/80 bg-surface/80 hover:bg-surface text-foreground/75 hover:text-foreground text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Feature Pills Strip */}
        <div className="relative mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center gap-2 text-[11px] text-foreground/60 font-medium">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface/60 border border-border/50">
            <Zap className="w-3 h-3 text-amber-500" /> Instant Online Checkout
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface/60 border border-border/50">
            <Smartphone className="w-3 h-3 text-primary" /> Direct UPI &amp; QR
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface/60 border border-border/50">
            <Banknote className="w-3 h-3 text-emerald-500" /> 0% Platform Commission
          </span>
        </div>
      </div>

      {/* ── Alerts ── */}
      {errorMessage && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-500 text-xs font-bold animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-500 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="leading-snug">{successMessage}</span>
        </div>
      )}

      {/* ── STEP 1: Payment Acceptance Mode ── */}
      <div className="p-4 sm:p-6 rounded-3xl bg-card border border-border/80 space-y-3.5 sm:space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
              <span>01</span>
              <span className="text-border">•</span>
              <span>Core Policy</span>
            </span>
            <h3 className="text-sm sm:text-base font-black text-foreground mt-0.5">
              Payment Acceptance Mode
            </h3>
            <p className="text-xs text-foreground/60 mt-0.5 leading-relaxed">
              Choose how players can pay when registering for your tournaments and bookings.
            </p>
          </div>
        </div>

        {/* 3 Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3.5 pt-1">
          {/* 1. Hybrid (BOTH) */}
          <button
            type="button"
            onClick={() => setPaymentMode('BOTH')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between group active:scale-[0.99] ${
              paymentMode === 'BOTH'
                ? 'bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-primary shadow-sm shadow-primary/10 ring-1 ring-primary/40'
                : 'bg-surface/50 border-border/80 hover:border-border hover:bg-surface/80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    paymentMode === 'BOTH' ? 'bg-primary text-black' : 'bg-foreground/5 text-foreground/60'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-foreground block">
                      Hybrid Checkout
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-primary">
                      Both Online &amp; Offline
                    </span>
                  </div>
                </div>

                {paymentMode === 'BOTH' ? (
                  <div className="w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                    POPULAR
                  </span>
                )}
              </div>

              <p className="text-[11px] text-foreground/60 leading-relaxed font-medium mt-1">
                Players can choose instant Razorpay card/UPI checkout or pay cash/spot UPI at venue.
              </p>
            </div>

            <div className="pt-2.5 mt-2.5 border-t border-border/40 flex items-center justify-between text-[10px] font-bold">
              <span className="text-primary font-black">RECOMMENDED</span>
              <span className="text-foreground/50">Max Registrations</span>
            </div>
          </button>

          {/* 2. Spot / Offline Only */}
          <button
            type="button"
            onClick={() => setPaymentMode('OFFLINE_ONLY')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between group active:scale-[0.99] ${
              paymentMode === 'OFFLINE_ONLY'
                ? 'bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                : 'bg-surface/50 border-border/80 hover:border-border hover:bg-surface/80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    paymentMode === 'OFFLINE_ONLY' ? 'bg-emerald-500 text-black' : 'bg-foreground/5 text-foreground/60'
                  }`}>
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-foreground block">
                      Spot / Direct Only
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500">
                      Zero Gateway Fees
                    </span>
                  </div>
                </div>

                {paymentMode === 'OFFLINE_ONLY' ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    0% FEES
                  </span>
                )}
              </div>

              <p className="text-[11px] text-foreground/60 leading-relaxed font-medium mt-1">
                Zero gateway deductions. Players pay directly to your venue UPI QR, Bank, or Cash desk.
              </p>
            </div>

            <div className="pt-2.5 mt-2.5 border-t border-border/40 flex items-center justify-between text-[10px] font-bold">
              <span className="text-emerald-500">DIRECT SETTLEMENT</span>
              <span className="text-foreground/50">Manual Verification</span>
            </div>
          </button>

          {/* 3. Online Gateway Only */}
          <button
            type="button"
            onClick={() => setPaymentMode('ONLINE_ONLY')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between group active:scale-[0.99] ${
              paymentMode === 'ONLINE_ONLY'
                ? 'bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border-amber-500 shadow-sm shadow-amber-500/10 ring-1 ring-amber-500/40'
                : 'bg-surface/50 border-border/80 hover:border-border hover:bg-surface/80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    paymentMode === 'ONLINE_ONLY' ? 'bg-amber-500 text-black' : 'bg-foreground/5 text-foreground/60'
                  }`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-foreground block">
                      Online Gateway Only
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-500">
                      Fully Automated
                    </span>
                  </div>
                </div>

                {paymentMode === 'ONLINE_ONLY' ? (
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    AUTO
                  </span>
                )}
              </div>

              <p className="text-[11px] text-foreground/60 leading-relaxed font-medium mt-1">
                Slots and registrations are only confirmed when an online payment is completed on Razorpay.
              </p>
            </div>

            <div className="pt-2.5 mt-2.5 border-t border-border/40 flex items-center justify-between text-[10px] font-bold">
              <span className="text-amber-500">INSTANT CONFIRMATION</span>
              <span className="text-foreground/50">Auto Reconciliation</span>
            </div>
          </button>
        </div>
      </div>

      {/* ── STEP 2: Direct Offline & Spot Settlement Setup ── */}
      {(paymentMode === 'OFFLINE_ONLY' || paymentMode === 'BOTH') && (
        <div className="p-4 sm:p-6 rounded-3xl bg-card border border-border/80 space-y-4 sm:space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                <span>02</span>
                <span className="text-border">•</span>
                <span>Direct Settlement</span>
              </span>
              <h3 className="text-sm sm:text-base font-black text-foreground mt-0.5">
                Offline Channels &amp; Direct UPI Details
              </h3>
              <p className="text-xs text-foreground/60 mt-0.5 leading-relaxed">
                Configure which spot methods are accepted and your direct settlement credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPlayerPreview(!showPlayerPreview)}
              className="px-2.5 py-1.5 rounded-xl border border-border/80 bg-surface/80 text-foreground/80 hover:text-foreground text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
              title="Preview how participants see these details"
            >
              {showPlayerPreview ? <EyeOff className="w-3.5 h-3.5 text-primary" /> : <Eye className="w-3.5 h-3.5 text-primary" />}
              <span className="hidden sm:inline">{showPlayerPreview ? 'Hide Preview' : 'Player Preview'}</span>
            </button>
          </div>

          {/* Tactile Channel Switchers (Pills) */}
          <div className="space-y-2">
            <label className="text-xs font-black text-foreground uppercase tracking-wide">
              Accepted Offline Channels
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
              {/* Cash at Venue Desk */}
              <button
                type="button"
                onClick={() => setOfflineCashAllowed(!offlineCashAllowed)}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between active:scale-[0.98] ${
                  offlineCashAllowed
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-foreground'
                    : 'bg-surface/40 border-border/60 text-foreground/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">💵</span>
                  <div>
                    <span className="text-xs font-bold block">Cash at Venue</span>
                    <span className="text-[10px] text-foreground/50 font-medium">Pay at reception desk</span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  offlineCashAllowed ? 'bg-emerald-500 text-black' : 'border border-border/80'
                }`}>
                  {offlineCashAllowed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </button>

              {/* Direct UPI / QR */}
              <button
                type="button"
                onClick={() => setOfflineUpiAllowed(!offlineUpiAllowed)}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between active:scale-[0.98] ${
                  offlineUpiAllowed
                    ? 'bg-primary/10 border-primary/50 text-foreground'
                    : 'bg-surface/40 border-border/60 text-foreground/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📱</span>
                  <div>
                    <span className="text-xs font-bold block">Direct UPI / QR</span>
                    <span className="text-[10px] text-foreground/50 font-medium">Scan &amp; pay directly</span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  offlineUpiAllowed ? 'bg-primary text-black' : 'border border-border/80'
                }`}>
                  {offlineUpiAllowed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </button>

              {/* Bank Transfer */}
              <button
                type="button"
                onClick={() => setOfflineBankTransferAllowed(!offlineBankTransferAllowed)}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between active:scale-[0.98] ${
                  offlineBankTransferAllowed
                    ? 'bg-amber-500/10 border-amber-500/50 text-foreground'
                    : 'bg-surface/40 border-border/60 text-foreground/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🏛️</span>
                  <div>
                    <span className="text-xs font-bold block">Bank Transfer</span>
                    <span className="text-[10px] text-foreground/50 font-medium">IMPS / NEFT transfer</span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  offlineBankTransferAllowed ? 'bg-amber-500 text-black' : 'border border-border/80'
                }`}>
                  {offlineBankTransferAllowed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </button>
            </div>
          </div>

          {/* Live Player Preview Card (Collapsible) */}
          {showPlayerPreview && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-surface/90 to-surface/40 border border-primary/30 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Player Checkout Preview
                </span>
                <span className="text-[10px] font-bold text-foreground/50">Simulated View</span>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border space-y-2 text-xs">
                <div className="font-bold text-foreground flex items-center justify-between">
                  <span>Pay Offline / Spot to Organizer</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-black">ACTIVE</span>
                </div>
                {offlineUpiId && (
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-foreground/60">UPI ID:</span>
                    <span className="font-mono font-bold text-primary">{offlineUpiId}</span>
                  </div>
                )}
                {offlineAccountNumber && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-foreground/60">A/C Number:</span>
                    <span className="font-mono font-bold text-foreground">{offlineAccountNumber} ({offlineIfscCode || 'IFSC'})</span>
                  </div>
                )}
                {offlineInstructions && (
                  <p className="text-[11px] text-foreground/75 italic bg-surface/80 p-2 rounded-lg border border-border/50">
                    &ldquo;{offlineInstructions}&rdquo;
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Direct UPI Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {/* Direct UPI ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Direct UPI ID / VPA</span>
                {offlineUpiId && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(offlineUpiId, 'upi')}
                    className="text-[10px] text-primary flex items-center gap-1 hover:underline"
                  >
                    {copiedKey === 'upi' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'upi' ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/40 text-xs font-bold font-mono">
                  @
                </div>
                <input
                  type="text"
                  value={offlineUpiId}
                  onChange={(e) => setOfflineUpiId(e.target.value)}
                  placeholder="e.g. sportsclub@okhdfcbank"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-surface border border-border/80 text-foreground text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-foreground/30 font-mono"
                />
              </div>
            </div>

            {/* UPI QR Code Image URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>UPI QR Code Image URL</span>
                <span className="text-[10px] text-foreground/40 font-normal">Optional</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/40">
                  <QrCode className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={offlineUpiQrUrl}
                  onChange={(e) => setOfflineUpiQrUrl(e.target.value)}
                  placeholder="https://.../upi-qr.png"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-surface border border-border/80 text-foreground text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-foreground/30"
                />
              </div>
            </div>
          </div>

          {/* Direct Bank Account Details Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-surface/50 border border-border/70 space-y-3">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black text-foreground">
                Bank Transfer Credentials (NEFT / IMPS)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Account Holder Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground/80 flex items-center gap-1">
                  <User className="w-3 h-3 text-foreground/40" />
                  <span>Account Holder Name</span>
                </label>
                <input
                  type="text"
                  value={offlineAccountHolder}
                  onChange={(e) => setOfflineAccountHolder(e.target.value)}
                  placeholder="e.g. Apex Sports Club"
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-foreground/30"
                />
              </div>

              {/* Bank Account Number */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground/80 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-foreground/40" />
                  <span>Account Number</span>
                </label>
                <input
                  type="text"
                  value={offlineAccountNumber}
                  onChange={(e) => setOfflineAccountNumber(e.target.value)}
                  placeholder="e.g. 501002348912"
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-foreground/30 font-mono"
                />
              </div>

              {/* IFSC Code */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground/80 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-foreground/40" />
                  <span>IFSC Code</span>
                </label>
                <input
                  type="text"
                  value={offlineIfscCode}
                  onChange={(e) => setOfflineIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HDFC0001234"
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all uppercase placeholder:text-foreground/30 font-mono"
                />
              </div>

              {/* Bank Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground/80 flex items-center gap-1">
                  <Landmark className="w-3 h-3 text-foreground/40" />
                  <span>Bank &amp; Branch Name</span>
                </label>
                <input
                  type="text"
                  value={offlineBankName}
                  onChange={(e) => setOfflineBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank, Koramangala"
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-foreground/30"
                />
              </div>
            </div>
          </div>

          {/* Custom Offline Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Custom Checkout Instructions for Players</span>
              <span className="text-[10px] text-foreground/40 font-normal">Shown on mobile registration</span>
            </label>
            <textarea
              rows={2}
              value={offlineInstructions}
              onChange={(e) => setOfflineInstructions(e.target.value)}
              placeholder="e.g. Please bring exact cash to reception 30m prior to match or WhatsApp payment screenshot to +91 9876543210 with your Team Name."
              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border/80 text-foreground text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none placeholder:text-foreground/30"
            />
          </div>
        </div>
      )}

      {/* ── STEP 3: Razorpay Route Online Gateway Integration ── */}
      {(paymentMode === 'ONLINE_ONLY' || paymentMode === 'BOTH') && (
        <div className="p-4 sm:p-6 rounded-3xl bg-card border border-border/80 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                <span>03</span>
                <span className="text-border">•</span>
                <span>Online Gateway</span>
              </span>
              <h3 className="text-sm sm:text-base font-black text-foreground mt-0.5">
                Razorpay Route Integration
              </h3>
              <p className="text-xs text-foreground/60 mt-0.5 leading-relaxed">
                Automate instant checkout verification and direct payouts into your organization account.
              </p>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          {!isOnlineActive ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-surface/60 border border-border/80 text-center space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-500 flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black uppercase">
                  Razorpay Not Connected
                </span>
                <p className="text-xs text-foreground/70 font-medium leading-relaxed">
                  Connect Razorpay Route to activate online payments for UPI Apps (GPay, PhonePe), Cards, and Netbanking.
                </p>
              </div>

              <button
                type="button"
                onClick={handleEnableOnlinePayments}
                disabled={enabling}
                className="px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20 inline-flex items-center gap-2 disabled:opacity-50"
              >
                {enabling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting Gateway...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Connect Razorpay Route</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Linked Gateway Status */}
              <div className="p-3.5 rounded-2xl bg-surface/60 border border-border/80 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                  Account Status
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Razorpay Route Account</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] font-black uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>ACTIVE</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/40 text-[11px] text-foreground/60 font-medium flex items-center justify-between">
                  <span>Merchant ID:</span>
                  <span className="font-mono text-foreground font-bold">{config?.maskedBankAccount || 'acc_connected'}</span>
                </div>
              </div>

              {/* Online Acceptance Capability */}
              <div className="p-3.5 rounded-2xl bg-surface/60 border border-border/80 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                  Online Capability
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Accept Online Orders</span>
                    <span className="text-[10px] text-foreground/50">Auto-verify participant slot</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTogglePayments}
                    disabled={toggling}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center active:scale-95 ${
                      config?.paymentsEnabled ? 'bg-primary justify-end' : 'bg-surface border border-border justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-black shadow-md flex items-center justify-center">
                      {toggling && <Loader2 className="w-2.5 h-2.5 text-white animate-spin" />}
                    </div>
                  </button>
                </div>
                <div className="pt-2 border-t border-border/40 text-[11px] text-emerald-500 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Direct Bank Payouts Active
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Mobile Floating Bottom Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-40 p-3 bg-card/95 backdrop-blur-xl border-t border-border/80 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-bold text-foreground">
            {paymentMode === 'BOTH' ? 'Hybrid' : paymentMode === 'OFFLINE_ONLY' ? 'Spot / UPI' : 'Online'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchConfig}
            disabled={loading}
            className="p-2 rounded-xl border border-border bg-surface text-foreground/70 active:scale-95 transition-all text-xs font-bold"
            title="Sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-primary/25 flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

