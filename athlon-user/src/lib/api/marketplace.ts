import { fetchClient, ApiError } from './client';

export type ProductCondition = 'NEW' | 'LIKE_NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'USED';
export type ProductType = 'NEW' | 'USED' | 'DEMO' | 'REFURBISHED';
export type SellerType = 'INDIVIDUAL' | 'SHOP';
export type ProductStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'AVAILABLE'
  | 'RESERVED'
  | 'SOLD'
  | 'PAUSED'
  | 'OUT_OF_STOCK'
  | 'REJECTED';

export interface MarketCategory {
  id: string;
  name: string;
  sport: string;
  slug?: string;
  icon?: string;
  subcategories?: string[];
  productCount?: number;
}

export interface MarketProduct {
  id: string;
  uuid: string;
  name: string;
  brand: string;
  model: string;
  sport: string;
  categoryId: string;
  categoryName: string;
  price: number;
  originalPrice?: number;
  mrp?: number;
  negotiable: boolean;
  condition: ProductCondition;
  productType: ProductType;
  status: ProductStatus;
  images: string[];
  primaryImage: string;
  description: string;
  location: string;
  pickupAvailable: boolean;
  shippingAvailable: boolean;
  warrantyAvailable: boolean;
  invoiceAvailable: boolean;
  reasonForSelling?: string;
  sellerType: SellerType;
  sellerUserId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerRoleBadge: string;
  shopId?: string;
  shopName?: string;
  attributes?: Record<string, string | number>;
  viewsCount?: number;
  wishlistCount?: number;
  createdAt: string;
}

export interface MarketShop {
  id: string;
  uuid: string;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description: string;
  location: string;
  address: string;
  contactNumber: string;
  businessEmail: string;
  rating: number;
  reviewCount: number;
  sportsOffered: string[];
  isVerified: boolean;
  productsCount: number;
  activeOrdersCount: number;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
}

export interface AppModuleConfig {
  athlonActive: boolean;
  marketActive: boolean;
  defaultMode: 'ATHLON' | 'MARKET';
  showModeSwitcher: boolean;
  activeModes: string[];
  description?: string;
}

export interface SubscriptionPlan {
  id: string;
  category: 'INDIVIDUAL' | 'SHOP';
  name: string;
  tagline?: string;
  priceMonthly: number;
  priceYearly?: number;
  commissionPercent: number;
  maxListings: number;
  popular?: boolean;
  description: string;
  features: string[];
}

export interface SellerEligibility {
  userId?: string;
  eligible: boolean;
  eligibilityType: 'TOURNAMENT_PARTICIPATION' | 'INDIVIDUAL_SUBSCRIPTION' | 'SHOP_SUBSCRIPTION' | 'NOT_ELIGIBLE';
  sellerType: 'INDIVIDUAL_FREE' | 'INDIVIDUAL_SUBSCRIBED' | 'SHOP_OWNER' | 'NOT_ELIGIBLE';
  sellerCategory: 'INDIVIDUAL' | 'SHOP' | 'NONE';
  verifiedTournamentsCount: number;
  eligibleTournamentCount?: number;
  requiredTournamentCount: number;
  hasActiveSubscription: boolean;
  hasActiveShopSubscription?: boolean;
  subscriptionActive?: boolean;
  subscriptionTier?: string;
  shopSubscriptionTier?: string;
  maxActiveListings?: number;
  listingLimit?: number;
  commissionRatePercent?: number;
  commissionRate?: number;
  message?: string;
  recentTournaments?: {
    id: string;
    name: string;
    date: string;
    sport: string;
    status: string;
  }[];
}

export interface MarketOffer {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  buyerUserId: string;
  buyerName: string;
  sellerUserId: string;
  originalPrice: number;
  offeredPrice: number;
  status: 'PENDING' | 'ACCEPTED' | 'COUNTERED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';
  message?: string;
  counterPrice?: number;
  createdAt: string;
}

export interface MarketInquiry {
  id: string;
  productId: string;
  productName: string;
  buyerUserId: string;
  buyerName: string;
  sellerUserId: string;
  message: string;
  status: 'OPEN' | 'REPLIED' | 'CLOSED';
  createdAt: string;
}

// ─── DTO Mapping Helpers ───

function mapBackendProduct(p: any): MarketProduct {
  const images = Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop'];

  return {
    id: String(p.id),
    uuid: String(p.id),
    name: p.title || p.name || 'Sports Equipment',
    brand: p.brand || 'Generic',
    model: p.model || '',
    sport: p.sport || 'Badminton',
    categoryId: (p.sport || 'badminton').toLowerCase(),
    categoryName: p.category || 'Equipment',
    price: Number(p.price) || 0,
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    mrp: p.originalPrice ? Number(p.originalPrice) : Number(p.price) || 0,
    negotiable: true,
    condition: (p.condition as ProductCondition) || 'USED',
    productType: (p.condition === 'NEW' ? 'NEW' : 'USED') as ProductType,
    status: (p.status === 'AVAILABLE' ? 'ACTIVE' : p.status || 'ACTIVE') as ProductStatus,
    primaryImage: images[0],
    images,
    description: p.description || '',
    location: p.location || 'Athlon Arena',
    pickupAvailable: true,
    shippingAvailable: true,
    warrantyAvailable: Boolean(p.isVerified),
    invoiceAvailable: Boolean(p.isVerified),
    reasonForSelling: p.conditionDetails,
    sellerType: p.shopId ? 'SHOP' : 'INDIVIDUAL',
    sellerUserId: String(p.sellerId || 'usr-player'),
    sellerName: p.sellerName || 'Athlon Athlete',
    sellerAvatar: p.sellerAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    sellerRoleBadge: p.sellerRole || (p.shopId ? 'SPORTS SHOP' : 'ATHLON PLAYER'),
    shopId: p.shopId ? String(p.shopId) : undefined,
    viewsCount: p.viewsCount || 0,
    wishlistCount: p.wishlistCount || 0,
    createdAt: p.createdAt || new Date().toISOString(),
  };
}

function mapBackendShop(s: any): MarketShop {
  return {
    id: String(s.id),
    uuid: String(s.id),
    name: s.name || s.shopName || 'Sports Shop',
    slug: s.slug || `shop-${s.id}`,
    logo: s.logoUrl || s.logo || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=200&auto=format&fit=crop',
    banner: s.bannerUrl || s.banner || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop',
    description: s.description || 'Authorized sports equipment pro shop on ATHLON.',
    location: s.location || (s.city ? `${s.city}, ${s.state || ''}` : 'Kerala, India'),
    address: s.address || '',
    contactNumber: s.contactNumber || s.contactPhone || '',
    businessEmail: s.businessEmail || s.contactEmail || '',
    rating: s.rating ? Number(s.rating) : 5.0,
    reviewCount: s.totalReviews ?? s.reviewCount ?? 0,
    sportsOffered: s.sportsOffered || ['Badminton', 'Cricket', 'Tennis'],
    isVerified: Boolean(s.isVerified),
    productsCount: s.productsCount || 0,
    activeOrdersCount: s.activeOrdersCount || 0,
    status: s.status || 'ACTIVE',
  };
}

// ─── Dynamic Marketplace API Service ───

export const MarketplaceApi = {
  // ─── Products ───
  getProducts: async (filters?: {
    sport?: string;
    category?: string;
    condition?: string;
    productType?: string;
    search?: string;
    sellerType?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    size?: number;
  }): Promise<MarketProduct[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.sport && filters.sport !== 'All') params.set('sport', filters.sport);
      if (filters?.category && filters.category !== 'All') params.set('category', filters.category);
      if (filters?.condition && filters.condition !== 'All') params.set('condition', filters.condition);
      if (filters?.search) params.set('query', filters.search);
      if (filters?.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
      if (filters?.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
      if (filters?.sort) params.set('sortBy', filters.sort);
      if (filters?.page !== undefined) params.set('page', String(filters.page));
      if (filters?.size !== undefined) params.set('size', String(filters.size));

      const queryStr = params.toString();
      const res = await fetchClient<any>(`/api/marketplace/products${queryStr ? `?${queryStr}` : ''}`);
      const rawList = res?.content || res?.data || (Array.isArray(res) ? res : null);
      if (rawList && Array.isArray(rawList)) {
        return rawList.map(mapBackendProduct);
      }
    } catch (e) {
      console.warn('MarketplaceApi.getProducts error:', e);
    }
    return [];
  },

  getProductById: async (id: string | number): Promise<MarketProduct | null> => {
    try {
      const res = await fetchClient<any>(`/api/marketplace/products/${id}`);
      const data = res?.data || res;
      if (data && (data.id || data.title)) {
        return mapBackendProduct(data);
      }
    } catch (e) {
      console.warn(`MarketplaceApi.getProductById(${id}) error:`, e);
    }
    return null;
  },

  createProduct: async (data: {
    name: string;
    brand: string;
    model?: string;
    sport: string;
    categoryId?: string;
    categoryName: string;
    price: number;
    originalPrice?: number;
    negotiable?: boolean;
    condition: ProductCondition;
    productType?: ProductType;
    description: string;
    reasonForSelling?: string;
    location: string;
    pickupAvailable?: boolean;
    shippingAvailable?: boolean;
    invoiceAvailable?: boolean;
    warrantyAvailable?: boolean;
    images: string[];
    primaryImage?: string;
    sellerType: SellerType;
    sellerUserId: string;
    sellerName: string;
    sellerRoleBadge?: string;
    shopId?: string;
    tags?: string;
  }): Promise<MarketProduct> => {
    const payload = {
      title: data.name,
      description: data.description,
      sport: data.sport,
      category: data.categoryName,
      price: data.price,
      originalPrice: data.originalPrice,
      condition: data.condition,
      conditionDetails: data.reasonForSelling,
      brand: data.brand,
      model: data.model,
      location: data.location,
      tags: data.tags || `${data.sport}, ${data.brand}`,
      sellerId: data.sellerUserId,
      sellerName: data.sellerName,
      sellerRole: data.sellerRoleBadge || (data.shopId ? 'Verified Shop' : 'Individual Seller'),
      shopId: data.shopId ? Number(data.shopId) || null : null,
      images: data.images,
    };

    const res = await fetchClient<any>('/api/marketplace/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const created = res?.data || res;
    return mapBackendProduct(created);
  },

  updateProduct: async (id: string | number, data: Partial<MarketProduct>): Promise<MarketProduct | null> => {
    try {
      const res = await fetchClient<any>(`/api/marketplace/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      const updated = res?.data || res;
      return mapBackendProduct(updated);
    } catch (e) {
      console.warn(`MarketplaceApi.updateProduct(${id}) error:`, e);
      return null;
    }
  },

  deleteProduct: async (id: string | number): Promise<boolean> => {
    try {
      await fetchClient<any>(`/api/marketplace/products/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (e) {
      console.warn(`MarketplaceApi.deleteProduct(${id}) error:`, e);
      return false;
    }
  },

  getProductsBySeller: async (sellerId: string): Promise<MarketProduct[]> => {
    try {
      const res = await fetchClient<any>(`/api/marketplace/products/seller/${encodeURIComponent(sellerId)}`);
      const list = res?.content || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list)) return list.map(mapBackendProduct);
    } catch (e) {
      console.warn('MarketplaceApi.getProductsBySeller error:', e);
    }
    return [];
  },

  getProductsByShop: async (shopId: string | number): Promise<MarketProduct[]> => {
    try {
      const res = await fetchClient<any>(`/api/marketplace/products/shop/${shopId}`);
      const list = res?.content || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list)) return list.map(mapBackendProduct);
    } catch (e) {
      console.warn('MarketplaceApi.getProductsByShop error:', e);
    }
    return [];
  },

  // ─── Shops ───
  getShops: async (): Promise<MarketShop[]> => {
    try {
      const res = await fetchClient<any>('/api/marketplace/shops');
      const list = res?.content || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list)) return list.map(mapBackendShop);
    } catch (e) {
      console.warn('MarketplaceApi.getShops error:', e);
    }
    return [];
  },

  getShopById: async (shopId: string | number): Promise<MarketShop | null> => {
    try {
      const res = await fetchClient<any>(`/api/marketplace/shops/${shopId}`);
      const data = res?.data || res;
      if (data && (data.id || data.name || data.shopName)) {
        return mapBackendShop(data);
      }
    } catch (e) {
      console.warn(`MarketplaceApi.getShopById(${shopId}) error:`, e);
    }
    return null;
  },

  getShopBySlug: async (slug: string): Promise<MarketShop | null> => {
    try {
      const res = await fetchClient<any>(`/api/marketplace/shops/slug/${encodeURIComponent(slug)}`);
      const data = res?.data || res;
      if (data && (data.id || data.name || data.shopName)) {
        return mapBackendShop(data);
      }
    } catch (e) {
      console.warn(`MarketplaceApi.getShopBySlug(${slug}) error:`, e);
    }
    return null;
  },

  createShop: async (data: {
    name: string;
    slug?: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    contactPhone?: string;
    contactEmail?: string;
    ownerUserId?: string;
    logoUrl?: string;
    bannerUrl?: string;
  }): Promise<MarketShop> => {
    const res = await fetchClient<any>('/api/marketplace/shops', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const created = res?.data || res;
    return mapBackendShop(created);
  },

  getShopsByOwner: async (ownerUserId: string): Promise<MarketShop[]> => {
    try {
      const res = await fetchClient<any>(`/api/marketplace/shops/owner/${encodeURIComponent(ownerUserId)}`);
      const list = res?.content || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list)) return list.map(mapBackendShop);
    } catch (e) {
      console.warn(`MarketplaceApi.getShopsByOwner(${ownerUserId}) error:`, e);
    }
    return [];
  },

  updateShop: async (shopId: string | number, data: Partial<MarketShop>): Promise<MarketShop | null> => {
    try {
      const res = await fetchClient<any>(`/api/marketplace/shops/update/${shopId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const updated = res?.data || res;
      return mapBackendShop(updated);
    } catch (e) {
      console.warn(`MarketplaceApi.updateShop(${shopId}) error:`, e);
      return null;
    }
  },

  // ─── Categories ───
  getCategories: async (sport?: string): Promise<MarketCategory[]> => {
    try {
      const query = sport && sport !== 'All' ? `?sport=${encodeURIComponent(sport)}` : '';
      const res = await fetchClient<any>(`/api/marketplace/categories${query}`);
      const list = Array.isArray(res) ? res : res?.data;
      if (Array.isArray(list) && list.length > 0) {
        return list.map((c: any) => ({
          id: c.slug || String(c.id),
          name: c.name,
          sport: c.sport || 'All',
          slug: c.slug,
          icon: c.iconName || c.slug,
        }));
      }
    } catch (e) {
      console.warn('MarketplaceApi.getCategories error:', e);
    }

    // Default basic categories if service starting
    return [
      { id: 'all', name: 'All', sport: 'All', icon: 'all' },
      { id: 'badminton', name: 'Badminton', sport: 'Badminton', icon: 'badminton', subcategories: ['Rackets', 'Shoes', 'Shuttles', 'Grips', 'Bags'] },
      { id: 'cricket', name: 'Cricket', sport: 'Cricket', icon: 'cricket', subcategories: ['Bats', 'Balls', 'Pads', 'Gloves', 'Helmets'] },
      { id: 'football', name: 'Football', sport: 'Football', icon: 'football', subcategories: ['Boots', 'Balls', 'Gloves', 'Jerseys'] },
      { id: 'tennis', name: 'Tennis', sport: 'Tennis', icon: 'tennis', subcategories: ['Rackets', 'Balls', 'Shoes', 'Strings'] },
      { id: 'volleyball', name: 'Volleyball', sport: 'Volleyball', icon: 'volleyball', subcategories: ['Balls', 'Shoes', 'Nets'] },
    ];
  },

  // ─── Wishlist ───
  getWishlist: (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('athlon_market_wishlist');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  },

  isWishlisted: (productId: string | number): boolean => {
    const list = MarketplaceApi.getWishlist();
    return list.includes(String(productId));
  },

  toggleWishlist: async (productId: string | number): Promise<boolean> => {
    const sId = String(productId);
    const list = MarketplaceApi.getWishlist();
    const exists = list.includes(sId);
    const updated = exists ? list.filter((id) => id !== sId) : [...list, sId];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('athlon_market_wishlist', JSON.stringify(updated));
      } catch {}
    }
    try {
      await fetchClient<any>(`/api/marketplace/products/${productId}/wishlist`, {
        method: 'POST',
      });
    } catch {}
    return !exists;
  },

  // ─── Offers & Negotiation ───
  getOffers: async (filter?: { productId?: string; buyerId?: string; sellerId?: string }): Promise<MarketOffer[]> => {
    try {
      const params = new URLSearchParams();
      if (filter?.productId) params.set('productId', filter.productId);
      if (filter?.buyerId) params.set('buyerId', filter.buyerId);
      if (filter?.sellerId) params.set('sellerId', filter.sellerId);

      const queryStr = params.toString();
      const res = await fetchClient<any>(`/api/marketplace/offers${queryStr ? `?${queryStr}` : ''}`);
      const list = Array.isArray(res) ? res : res?.data;
      if (Array.isArray(list)) return list;
    } catch (e) {
      console.warn('MarketplaceApi.getOffers error:', e);
    }
    return [];
  },

  makeOffer: async (productId: string | number, offeredPrice: number, message?: string): Promise<MarketOffer> => {
    const res = await fetchClient<any>('/api/marketplace/offers', {
      method: 'POST',
      body: JSON.stringify({
        productId: Number(productId),
        offerAmount: offeredPrice,
        message,
      }),
    });
    return res?.data || res;
  },

  updateOfferStatus: async (
    offerId: string | number,
    status: 'ACCEPTED' | 'DECLINED' | 'COUNTERED',
    counterPrice?: number
  ): Promise<any> => {
    const res = await fetchClient<any>(`/api/marketplace/offers/${offerId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, counterPrice }),
    });
    return res?.data || res;
  },

  // ─── Inquiries & Customer Desk ───
  getInquiries: async (filter?: { productId?: string; sellerId?: string }): Promise<MarketInquiry[]> => {
    try {
      const params = new URLSearchParams();
      if (filter?.productId) params.set('productId', filter.productId);
      if (filter?.sellerId) params.set('sellerId', filter.sellerId);

      const queryStr = params.toString();
      const res = await fetchClient<any>(`/api/marketplace/inquiries${queryStr ? `?${queryStr}` : ''}`);
      const list = Array.isArray(res) ? res : res?.data;
      if (Array.isArray(list)) return list;
    } catch (e) {
      console.warn('MarketplaceApi.getInquiries error:', e);
    }
    return [];
  },

  sendInquiry: async (productId: string | number, message: string, buyerName?: string): Promise<MarketInquiry> => {
    const res = await fetchClient<any>('/api/marketplace/inquiries', {
      method: 'POST',
      body: JSON.stringify({
        productId: Number(productId),
        message,
        buyerName,
      }),
    });
    return res?.data || res;
  },

  // ─── Image / Media Upload ───
  uploadMedia: async (file: File, folder: string = 'products'): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetchClient<{ url?: string; error?: string }>('/api/marketplace/media/upload', {
        method: 'POST',
        body: formData,
      });
      if (res?.url) return res.url;
    } catch (e) {
      console.warn('MarketplaceApi.uploadMedia error:', e);
    }
    return URL.createObjectURL(file);
  },

  // ─── Orders & Checkout ───
  createOrder: async (data: {
    productId: string | number;
    buyerUserId?: string;
    buyerName?: string;
    buyerPhone?: string;
    shippingAddress: string;
    paymentMethod?: string;
    offeredPrice?: number;
  }) => {
    const res = await fetchClient<any>('/api/marketplace/orders', {
      method: 'POST',
      body: JSON.stringify({
        productId: Number(data.productId),
        buyerUserId: data.buyerUserId,
        buyerName: data.buyerName,
        buyerPhone: data.buyerPhone,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod || 'COMMUNITY_ESCROW',
        offeredPrice: data.offeredPrice,
      }),
    });
    return res?.data || res;
  },

  // ─── Subscriptions & Seller Eligibility ───
  getSellerEligibility: async (userId?: string): Promise<SellerEligibility> => {
    try {
      const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      const res = await fetchClient<any>(`/api/marketplace/seller/eligibility${query}`);
      const data = res?.data || res;
      if (data && typeof data.eligible === 'boolean') {
        return {
          userId: data.userId,
          eligible: data.eligible,
          eligibilityType: data.eligibilityType || (data.hasActiveSubscription ? 'INDIVIDUAL_SUBSCRIPTION' : 'TOURNAMENT_PARTICIPATION'),
          sellerType: data.sellerType || (data.eligible ? 'INDIVIDUAL_FREE' : 'NOT_ELIGIBLE'),
          sellerCategory: data.sellerCategory || 'INDIVIDUAL',
          verifiedTournamentsCount: data.verifiedTournamentsCount ?? 0,
          eligibleTournamentCount: data.verifiedTournamentsCount ?? 0,
          requiredTournamentCount: data.requiredTournamentCount ?? 3,
          hasActiveSubscription: !!data.hasActiveSubscription,
          subscriptionActive: !!data.hasActiveSubscription,
          subscriptionTier: data.subscriptionTier || 'NONE',
          shopSubscriptionTier: data.shopSubscriptionTier || data.subscriptionTier || 'NONE',
          maxActiveListings: data.maxActiveListings ?? 5,
          listingLimit: data.maxActiveListings ?? 5,
          commissionRatePercent: data.commissionRatePercent ?? 5.0,
          commissionRate: data.commissionRatePercent ?? 5.0,
          message: data.message || '',
        };
      }
    } catch (e) {
      console.warn('MarketplaceApi.getSellerEligibility error:', e);
    }

    return {
      eligible: false,
      eligibilityType: 'NOT_ELIGIBLE',
      sellerType: 'NOT_ELIGIBLE',
      sellerCategory: 'NONE',
      verifiedTournamentsCount: 0,
      eligibleTournamentCount: 0,
      requiredTournamentCount: 3,
      hasActiveSubscription: false,
      subscriptionActive: false,
      subscriptionTier: 'NONE',
      maxActiveListings: 5,
      listingLimit: 5,
      commissionRatePercent: 5.0,
      commissionRate: 5.0,
      message: 'Participate in 3 tournaments or subscribe to start selling.',
    };
  },

  getSubscriptionPlans: async (category?: 'INDIVIDUAL' | 'SHOP'): Promise<SubscriptionPlan[]> => {
    try {
      const query = category ? `?category=${category}` : '';
      const res = await fetchClient<any>(`/api/marketplace/subscriptions/plans${query}`);
      const list = res?.data || res;
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (e) {
      console.warn('MarketplaceApi.getSubscriptionPlans error:', e);
    }

    // Default dynamic pricing blueprint
    const defaultPlans: SubscriptionPlan[] = [
      {
        id: 'INDIVIDUAL_PASS',
        category: 'INDIVIDUAL',
        name: 'Athlete Seller Pass',
        tagline: 'For athletes & individual gear sellers',
        priceMonthly: 199,
        priceYearly: 1499,
        commissionPercent: 2.5,
        maxListings: 25,
        description: 'Start selling sports equipment immediately without needing 3 tournament participations, with lower commission fee.',
        features: [
          'Instant selling clearance (0 tournaments needed)',
          'Up to 25 active gear listings',
          'Low 2.5% transaction commission',
          'Direct in-app buyer negotiation chat',
          'Community Escrow payment protection',
        ],
      },
      {
        id: 'SHOP_STARTER',
        category: 'SHOP',
        name: 'Shop Starter',
        tagline: 'For local sports clubs, restringing & stringers',
        priceMonthly: 599,
        priceYearly: 5499,
        commissionPercent: 3.0,
        maxListings: 50,
        description: 'Basic digital storefront for emerging sports clubs and specialty racket stringing/tuning businesses.',
        features: [
          'Dedicated Shop Storefront URL',
          'Up to 50 active inventory listings',
          '3.0% transaction commission',
          'Shop Inquiries desk & order manager',
          'Verified seller badge',
        ],
      },
      {
        id: 'SHOP_PRO',
        category: 'SHOP',
        name: 'Sports Shop Pro',
        tagline: 'For authorized dealers & brick-and-mortar sports shops',
        priceMonthly: 1299,
        priceYearly: 11999,
        commissionPercent: 2.0,
        maxListings: -1,
        popular: true,
        description: 'Full commercial storefront for authorized dealers with unlimited listings and lowest fees.',
        features: [
          'Custom Storefront with branded banner & logo',
          'Unlimited product listings',
          'Lowest 2.0% transaction commission',
          'Verified Pro Retailer badge',
          'Customer inquiries & quotation desk',
          'Priority placement in market search',
        ],
      },
      {
        id: 'SHOP_ENTERPRISE',
        category: 'SHOP',
        name: 'Enterprise Sports Hub',
        tagline: 'For multi-brand distributors & equipment hubs',
        priceMonthly: 2999,
        priceYearly: 27999,
        commissionPercent: 1.5,
        maxListings: -1,
        description: 'Enterprise solution with bulk catalog management and dedicated market curation.',
        features: [
          'Top homepage banner & search spotlight',
          'Lowest 1.5% platform commission',
          'Bulk CSV catalog & inventory sync',
          'Multiple staff manager logins',
          'Priority logistics & courier pickup support',
        ],
      },
    ];

    if (category) {
      return defaultPlans.filter((p) => p.category === category);
    }
    return defaultPlans;
  },

  activateSubscription: async (
    plan: string,
    userId?: string,
    billingPeriod: 'MONTHLY' | 'YEARLY' = 'MONTHLY'
  ) => {
    const res = await fetchClient<any>('/api/marketplace/subscriptions/activate', {
      method: 'POST',
      body: JSON.stringify({ plan, userId, billingPeriod }),
    });
    return res?.data || res;
  },

  // ─── Module Enablement & App Mode Config ───
  getModuleConfig: async (): Promise<AppModuleConfig> => {
    try {
      const res = await fetchClient<any>('/api/marketplace/config/modules');
      const data = res?.data || res;
      if (data && typeof data.athlonActive === 'boolean') {
        return {
          athlonActive: data.athlonActive,
          marketActive: data.marketActive,
          defaultMode: data.defaultMode || 'ATHLON',
          showModeSwitcher: data.athlonActive && data.marketActive,
          activeModes: data.activeModes || (data.athlonActive && data.marketActive ? ['ATHLON', 'MARKET'] : data.athlonActive ? ['ATHLON'] : ['MARKET']),
          description: data.description,
        };
      }
    } catch {}
    return {
      athlonActive: true,
      marketActive: true,
      defaultMode: 'ATHLON',
      showModeSwitcher: true,
      activeModes: ['ATHLON', 'MARKET'],
    };
  },

  updateModuleConfig: async (config: Partial<AppModuleConfig>): Promise<AppModuleConfig> => {
    try {
      const res = await fetchClient<any>('/api/marketplace/config/modules', {
        method: 'PUT',
        body: JSON.stringify(config),
      });
      const data = res?.data || res;
      return {
        athlonActive: data.athlonActive ?? true,
        marketActive: data.marketActive ?? true,
        defaultMode: data.defaultMode || 'ATHLON',
        showModeSwitcher: (data.athlonActive ?? true) && (data.marketActive ?? true),
        activeModes: data.activeModes || [],
        description: data.description,
      };
    } catch {
      return {
        athlonActive: config.athlonActive ?? true,
        marketActive: config.marketActive ?? true,
        defaultMode: config.defaultMode || 'ATHLON',
        showModeSwitcher: (config.athlonActive ?? true) && (config.marketActive ?? true),
        activeModes: ['ATHLON', 'MARKET'],
      };
    }
  },
};
