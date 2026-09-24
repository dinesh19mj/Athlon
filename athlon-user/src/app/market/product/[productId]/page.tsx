'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Share2,
  Heart,
  MapPin,
  ShieldCheck,
  Store,
  Tag,
  CheckCircle2,
  Clock,
  MessageSquare,
  DollarSign,
  AlertCircle,
  Truck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  MarketProduct,
  MarketplaceApi,
} from '@/lib/api/marketplace';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { AuthModal } from '@/components/auth/AuthModal';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.productId as string;

  const [product, setProduct] = useState<MarketProduct | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Offer Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offeredAmount, setOfferedAmount] = useState('');
  const [offerSuccess, setOfferSuccess] = useState(false);

  // Enquiry Modal State
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      setLoading(true);
      const data = await MarketplaceApi.getProductById(productId);
      setProduct(data);
      if (data) {
        setIsWishlisted(MarketplaceApi.isWishlisted(data.id));
      }
      setLoading(false);
    }
    loadProduct();
  }, [productId]);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!product) return;
    const nextState = await MarketplaceApi.toggleWishlist(product.id);
    setIsWishlisted(nextState);
  };

  const handleMakeOfferClick = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsOfferModalOpen(true);
  };

  const handleEnquireClick = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsEnquiryModalOpen(true);
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !offeredAmount) return;
    await MarketplaceApi.makeOffer(product.id, Number(offeredAmount));
    setOfferSuccess(true);
    setTimeout(() => {
      setOfferSuccess(false);
      setIsOfferModalOpen(false);
      setOfferedAmount('');
    }, 2000);
  };

  const handleSubmitEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySuccess(true);
    setTimeout(() => {
      setEnquirySuccess(false);
      setIsEnquiryModalOpen(false);
      setEnquiryMessage('');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="aspect-[4/3] rounded-3xl bg-card animate-pulse border border-white/5" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-foreground/40 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-foreground">Gear Not Found</h2>
        <p className="text-xs text-foreground/60 mt-1 mb-6">
          This product listing may have been sold, paused, or removed by the seller.
        </p>
        <Link
          href="/market"
          className="px-5 py-2.5 rounded-full text-xs font-black bg-primary text-primary-foreground hover:opacity-90"
        >
          Return to Market
        </Link>
      </div>
    );
  }

  const isShop = product.sellerType === 'SHOP';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-3 pb-16 space-y-6">
      {/* ─── Top Bar Navigation ─── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-foreground/70 hover:text-foreground p-2 rounded-full hover:bg-card transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`p-2.5 rounded-full border transition-all ${
              isWishlisted ? 'border-red-500/40 text-red-500 bg-red-500/10' : 'border-white/10 text-foreground/70 hover:text-foreground bg-card'
            }`}
            title="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: product.name, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Product link copied to clipboard!');
              }
            }}
            className="p-2.5 rounded-full border border-white/10 text-foreground/70 hover:text-foreground bg-card hover:bg-surface transition-all"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        {/* ─── Left: Image Gallery ─── */}
        <div className="space-y-3">
          <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border border-white/10 bg-surface shadow-2xl">
            <img
              src={product.images[activeImageIdx] || product.primaryImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Condition Pill */}
            <div className="absolute top-3 left-3 z-10">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/20">
                {product.condition}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIdx === idx ? 'border-primary scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Right: Product Details & Purchase Controls ─── */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Sport & Category Breadcrumbs */}
            <div className="flex items-center gap-2 text-[11px] font-bold text-foreground/50 uppercase tracking-wider">
              <span>{product.sport}</span>
              <span>•</span>
              <span>{product.categoryName}</span>
              <span>•</span>
              <span className="text-primary">{product.brand}</span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Pricing Section */}
            <div className="p-4 rounded-2xl border bg-card/60 backdrop-blur-md space-y-1.5" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-foreground">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-foreground/40 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {product.negotiable && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Negotiable
                  </span>
                )}
              </div>
              <p className="text-[11px] text-foreground/50">
                Direct community transaction • Zero platform markup for buyers
              </p>
            </div>

            {/* Seller Card */}
            <div
              className="p-4 rounded-2xl border flex items-center justify-between gap-4"
              style={{
                backgroundColor: 'var(--athlon-surface, #0D1612)',
                borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={product.sellerAvatar || '/placeholder.png'}
                    alt={product.sellerName}
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                  />
                  {isShop && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-500 border border-black" />
                  )}
                </div>
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-sm font-black text-foreground truncate">
                    {product.sellerName}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary mt-0.5 flex items-center gap-1">
                    {isShop ? (
                      <>
                        <Store className="w-3 h-3 text-blue-400 shrink-0" />
                        <span>VERIFIED SPORTS SHOP</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3 h-3 text-primary shrink-0" />
                        <span>ATHLON VERIFIED PLAYER</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-foreground/60 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-foreground/40" />
                <span>{product.location}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-foreground/60">
                Seller Description
              </h2>
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Technical Attributes */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <h2 className="text-xs font-black uppercase tracking-wider text-foreground/60">
                  Equipment Specifications
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-2.5 rounded-xl border border-white/5 bg-card/40 flex flex-col"
                    >
                      <span className="text-[10px] font-bold text-foreground/40 uppercase">{key}</span>
                      <span className="text-xs font-bold text-foreground mt-0.5">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Bottom Action Bar ─── */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              {product.negotiable && (
                <button
                  type="button"
                  onClick={handleMakeOfferClick}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-black border border-white/20 hover:border-primary text-foreground hover:text-primary transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Make Offer</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleEnquireClick}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-black bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                style={{
                  backgroundColor: 'var(--athlon-primary, #22C55E)',
                  color: 'var(--athlon-primary-foreground, #000)',
                }}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Seller</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Make Offer Modal ─── */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl p-6 border bg-card space-y-4" style={{ borderColor: 'var(--athlon-border)' }}>
            <h3 className="text-base font-black text-foreground">Make an Offer</h3>
            <p className="text-xs text-foreground/60">
              Listed Price: <strong className="text-foreground">₹{product.price.toLocaleString('en-IN')}</strong>
            </p>

            {offerSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-white">Offer Submitted!</p>
                <p className="text-[10px] text-white/70">The seller will be notified to review or counter.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitOffer} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-foreground/70 block mb-1">Your Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={product.price}
                    value={offeredAmount}
                    onChange={(e) => setOfferedAmount(e.target.value)}
                    placeholder="Enter offer amount..."
                    className="w-full px-4 py-3 rounded-xl border bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOfferModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-foreground/70"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black"
                  >
                    Send Offer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── Enquiry Modal ─── */}
      {isEnquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl p-6 border bg-card space-y-4" style={{ borderColor: 'var(--athlon-border)' }}>
            <h3 className="text-base font-black text-foreground">Enquire about this gear</h3>
            <p className="text-xs text-foreground/60">Direct question for {product.sellerName}</p>

            {enquirySuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-white">Message Sent!</p>
                <p className="text-[10px] text-white/70">The seller will respond via your notifications.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnquiry} className="space-y-4">
                <div>
                  <textarea
                    required
                    rows={3}
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    placeholder="Is this still available? Can we meet at the stadium court?"
                    className="w-full p-3 rounded-xl border bg-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEnquiryModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-foreground/70"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal for protected actions */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode="login"
      />
    </div>
  );
}
