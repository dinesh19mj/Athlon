'use client';

import React, { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronLeft,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { MarketplaceApi, ProductCondition, ProductType } from '@/lib/api/marketplace';
import { useAuthStore } from '@/lib/store/useAuthStore';

function CreateListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sellerIdentity = searchParams.get('sellerIdentity') || 'PERSONAL';

  const userEmail = useAuthStore((state) => state.userEmail);
  const userId = useAuthStore((state) => state.userId);

  const [sport, setSport] = useState('Badminton');
  const [categoryName, setCategoryName] = useState('Rackets');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState<ProductCondition>('EXCELLENT');
  const [sellingPrice, setSellingPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [negotiable, setNegotiable] = useState(true);
  const [description, setDescription] = useState('');
  const [reasonForSelling, setReasonForSelling] = useState('');
  const [location, setLocation] = useState('Thiruvananthapuram');
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [shippingAvailable, setShippingAvailable] = useState(true);
  const [invoiceAvailable, setInvoiceAvailable] = useState(false);
  const [warrantyAvailable, setWarrantyAvailable] = useState(false);
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop',
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [eligibility, setEligibility] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function loadEligibility() {
      if (userId) {
        const el = await MarketplaceApi.getSellerEligibility(userId);
        setEligibility(el);
      }
    }
    loadEligibility();
  }, [userId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        if (images.length < 5) {
          const url = await MarketplaceApi.uploadMedia(files[i], 'products');
          setImages((prev) => [...prev, url]);
        }
      }
    } catch {
      alert('Could not upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sellingPrice) return;
    setSubmitting(true);

    try {
      const isShop = sellerIdentity !== 'PERSONAL';
      const created = await MarketplaceApi.createProduct({
        name,
        brand: brand || 'Generic',
        model,
        sport,
        categoryId: sport.toLowerCase(),
        categoryName,
        price: Number(sellingPrice),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        negotiable,
        condition,
        productType: isShop ? 'NEW' : 'USED',
        description,
        reasonForSelling,
        location,
        pickupAvailable,
        shippingAvailable,
        invoiceAvailable,
        warrantyAvailable,
        images,
        primaryImage: images[0],
        sellerType: isShop ? 'SHOP' : 'INDIVIDUAL',
        sellerUserId: userId || 'curr-user',
        sellerName: isShop ? 'ABC Sports' : (userEmail?.split('@')[0] || 'Dinesh'),
        sellerRoleBadge: isShop ? 'SPORTS SHOP' : 'ATHLON PLAYER',
        shopId: isShop ? sellerIdentity : undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(`/market/product/${created.id}`);
      }, 1500);
    } catch {
      alert('Could not submit listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-3 pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1.5 rounded-full hover:bg-card text-foreground/70"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-foreground">
            Create Listing
          </h1>
        </div>

        {eligibility && (
          <div className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px] font-black flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{eligibility.commissionRatePercent ?? eligibility.commissionRate ?? 5.0}% Fee on Sale</span>
          </div>
        )}
      </div>

      {success ? (
        <div className="p-12 text-center rounded-3xl border border-emerald-500/30 bg-emerald-500/10 space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-black text-foreground">Listing Published Successfully!</h2>
          <p className="text-xs text-foreground/60 max-w-sm mx-auto">
            Your sports equipment is now live on ATHLON Market. Redirecting to your listing...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Sport & Category */}
          <div className="rounded-3xl border p-5 sm:p-6 bg-card space-y-4" style={{ borderColor: 'var(--athlon-border)' }}>
            <h2 className="text-xs font-black uppercase tracking-wider text-primary">
              1. Sport &amp; Category
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground/70 block mb-1">Sport *</label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <option value="Badminton">Badminton</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Football">Football</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Volleyball">Volleyball</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/70 block mb-1">Category *</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Rackets, Shoes, Kitbag"
                  className="w-full px-4 py-3 rounded-xl border bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Equipment Info */}
          <div className="rounded-3xl border p-5 sm:p-6 bg-card space-y-4" style={{ borderColor: 'var(--athlon-border)' }}>
            <h2 className="text-xs font-black uppercase tracking-wider text-primary">
              2. Equipment Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground/70 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Yonex Astrox 100 ZZ (Kurenai)"
                  className="w-full px-4 py-3 rounded-xl border bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground/70 block mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Yonex, Victor, SG, Nike"
                    className="w-full px-4 py-3 rounded-xl border bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/70 block mb-1">Model / Edition</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. 4UG5 Pro"
                    className="w-full px-4 py-3 rounded-xl border bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/70 block mb-1">Condition *</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ProductCondition)}
                  className="w-full px-4 py-3 rounded-xl border bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <option value="NEW">New (Unopened / Unused)</option>
                  <option value="LIKE_NEW">Like New (Mint condition, minimal use)</option>
                  <option value="EXCELLENT">Excellent (Very light use, minor scratches)</option>
                  <option value="GOOD">Good (Normal tournament/practice wear)</option>
                  <option value="FAIR">Fair (Visible cosmetic wear, perfectly playable)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/70 block mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail your string tension, racket grip size, tournament history, court clashes, or modifications..."
                  className="w-full p-4 rounded-xl border bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/70 block mb-1">Reason for Selling</label>
                <input
                  type="text"
                  value={reasonForSelling}
                  onChange={(e) => setReasonForSelling(e.target.value)}
                  placeholder="e.g. Upgrading racket / Wrong shoe size"
                  className="w-full px-4 py-3 rounded-xl border bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & Delivery */}
          <div className="rounded-3xl border p-5 sm:p-6 bg-card space-y-4" style={{ borderColor: 'var(--athlon-border)' }}>
            <h2 className="text-xs font-black uppercase tracking-wider text-primary">
              3. Pricing &amp; Location
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground/70 block mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="11500"
                  className="w-full px-4 py-3 rounded-xl border bg-surface text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/70 block mb-1">Original Purchase Price (₹)</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="18500"
                  className="w-full px-4 py-3 rounded-xl border bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="negotiableCheck"
                checked={negotiable}
                onChange={(e) => setNegotiable(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <label htmlFor="negotiableCheck" className="text-xs font-bold text-foreground/80 cursor-pointer">
                Allow buyers to make price offers (Negotiable)
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground/70 block mb-1">City / Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Thiruvananthapuram, Kerala"
                className="w-full px-4 py-3 rounded-xl border bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ borderColor: 'var(--athlon-border)' }}
              />
            </div>
          </div>

          {/* Section 4: Photo Gallery */}
          <div className="rounded-3xl border p-5 sm:p-6 bg-card space-y-4" style={{ borderColor: 'var(--athlon-border)' }}>
            <h2 className="text-xs font-black uppercase tracking-wider text-primary">
              4. Photos &amp; Verification
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white/70 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-black/70 text-emerald-400">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />

              {images.length < 5 && (
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-white/20 hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-foreground/60 hover:text-primary transition-all active:scale-95 bg-surface/40 cursor-pointer disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-[10px] font-bold">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span className="text-[10px] font-bold">Add Photo</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl text-xs font-black bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: 'var(--athlon-primary, #22C55E)',
                color: 'var(--athlon-primary-foreground, #000)',
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Publishing Listing...' : 'Publish Listing to Market'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function CreateListingPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-4xl mx-auto p-8 text-center text-xs text-foreground/50">Loading editor...</div>}>
      <CreateListingContent />
    </Suspense>
  );
}
