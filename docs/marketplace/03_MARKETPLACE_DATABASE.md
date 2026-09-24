# 03. MARKETPLACE DATABASE SCHEMA ARCHITECTURE

> **Target System**: ATHLON Marketplace  
> **Database Engine**: PostgreSQL 15+ (AWS RDS)  
> **Schema Naming Convention**: `snake_case`, explicit UUIDs, BigInt primary keys, Audit Timestamps  
> **Status**: APPROVED & COMPATIBLE (Additive Migrations Only)  

---

## 1. Migration Safety & Guarantees

All database modifications for the Marketplace module strictly adhere to non-breaking additive guidelines:
- **NO DROP TABLE / TRUNCATE**: Existing tables are untouched.
- **NO DELETION**: Zero data deletion or column removals.
- **NO CONFLICTS**: All table names are namespaced with `marketplace_`.
- **MONEY SAFETY**: All financial fields use `NUMERIC(14, 2)` (BigDecimal in Java). No `float` or `double`.
- **REUSE OF AUTHORITATIVE ENTITIES**: Does **not** duplicate `users`, `sports`, `tournaments`, `organizations`, or `payments`. References existing primary keys (`user_id`, `org_id`, `tournament_id`).

---

## 2. Table Specifications

### 2.1 `marketplace_seller_profiles`
Tracks user eligibility, active selling mode, and listing quotas.

```sql
CREATE TABLE IF NOT EXISTS marketplace_seller_profiles (
    seller_profile_id BIGSERIAL PRIMARY KEY,
    seller_profile_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL UNIQUE,
    user_uuid UUID NOT NULL,
    seller_mode VARCHAR(32) NOT NULL DEFAULT 'COMMISSION', -- COMMISSION, SUBSCRIPTION, SHOP
    eligible_tournament_count INT NOT NULL DEFAULT 0,
    is_eligible BOOLEAN NOT NULL DEFAULT FALSE,
    active_listing_count INT NOT NULL DEFAULT 0,
    listing_limit INT NOT NULL DEFAULT 5,
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00, -- 5%
    subscription_active BOOLEAN NOT NULL DEFAULT FALSE,
    subscription_expiry_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mkt_seller_user ON marketplace_seller_profiles(user_id);
```

### 2.2 `marketplace_shops`
Commercial sports retail establishments managed inside Market.

```sql
CREATE TABLE IF NOT EXISTS marketplace_shops (
    shop_id BIGSERIAL PRIMARY KEY,
    shop_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    owner_user_id BIGINT NOT NULL,
    owner_user_uuid UUID NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    description TEXT,
    location VARCHAR(120) NOT NULL,
    address TEXT,
    contact_number VARCHAR(32) NOT NULL,
    business_email VARCHAR(120) NOT NULL,
    gst_number VARCHAR(32),
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    review_count INT NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
    subscription_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, PAST_DUE, CANCELLED
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',               -- ACTIVE, PAUSED, SUSPENDED
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mkt_shop_owner ON marketplace_shops(owner_user_id);
CREATE INDEX idx_mkt_shop_slug ON marketplace_shops(slug);
```

### 2.3 `marketplace_categories`
Sports equipment hierarchy linked to ATHLON sports.

```sql
CREATE TABLE IF NOT EXISTS marketplace_categories (
    category_id BIGSERIAL PRIMARY KEY,
    category_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    sport_name VARCHAR(64) NOT NULL, -- Badminton, Cricket, Football, Tennis, Volleyball
    parent_category_id BIGINT REFERENCES marketplace_categories(category_id),
    icon_type VARCHAR(64),
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mkt_cat_sport ON marketplace_categories(sport_name);
```

### 2.4 `marketplace_products`
Product catalog for both individual sellers and sports shops.

```sql
CREATE TABLE IF NOT EXISTS marketplace_products (
    product_id BIGSERIAL PRIMARY KEY,
    product_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    sport_name VARCHAR(64) NOT NULL,
    category_id BIGINT NOT NULL REFERENCES marketplace_categories(category_id),
    price NUMERIC(14, 2) NOT NULL,
    original_price NUMERIC(14, 2),
    mrp NUMERIC(14, 2),
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    negotiable BOOLEAN NOT NULL DEFAULT TRUE,
    condition VARCHAR(32) NOT NULL DEFAULT 'USED', -- NEW, LIKE_NEW, EXCELLENT, GOOD, FAIR
    product_type VARCHAR(32) NOT NULL DEFAULT 'USED', -- NEW, USED, DEMO, REFURBISHED
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- DRAFT, PENDING_REVIEW, ACTIVE, RESERVED, SOLD, PAUSED, REJECTED
    primary_image_url TEXT NOT NULL,
    description TEXT,
    reason_for_selling TEXT,
    location VARCHAR(120) NOT NULL,
    pickup_available BOOLEAN NOT NULL DEFAULT TRUE,
    shipping_available BOOLEAN NOT NULL DEFAULT FALSE,
    warranty_available BOOLEAN NOT NULL DEFAULT FALSE,
    invoice_available BOOLEAN NOT NULL DEFAULT FALSE,
    seller_type VARCHAR(32) NOT NULL DEFAULT 'INDIVIDUAL', -- INDIVIDUAL, SHOP
    seller_user_id BIGINT NOT NULL,
    seller_user_uuid UUID NOT NULL,
    shop_id BIGINT REFERENCES marketplace_shops(shop_id),
    views_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mkt_prod_status ON marketplace_products(status);
CREATE INDEX idx_mkt_prod_sport ON marketplace_products(sport_name);
CREATE INDEX idx_mkt_prod_seller ON marketplace_products(seller_user_id);
CREATE INDEX idx_mkt_prod_shop ON marketplace_products(shop_id);
```

### 2.5 `marketplace_product_images`
Product gallery images.

```sql
CREATE TABLE IF NOT EXISTS marketplace_product_images (
    image_id BIGSERIAL PRIMARY KEY,
    image_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    product_id BIGINT NOT NULL REFERENCES marketplace_products(product_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mkt_img_product ON marketplace_product_images(product_id);
```

### 2.6 `marketplace_favorites`
User wishlists with strict uniqueness.

```sql
CREATE TABLE IF NOT EXISTS marketplace_favorites (
    favorite_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL REFERENCES marketplace_products(product_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_mkt_fav_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX idx_mkt_fav_user ON marketplace_favorites(user_id);
```

### 2.7 `marketplace_offers`
Buyer price negotiation offers.

```sql
CREATE TABLE IF NOT EXISTS marketplace_offers (
    offer_id BIGSERIAL PRIMARY KEY,
    offer_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    product_id BIGINT NOT NULL REFERENCES marketplace_products(product_id),
    buyer_user_id BIGINT NOT NULL,
    buyer_user_uuid UUID NOT NULL,
    seller_user_id BIGINT NOT NULL,
    original_price NUMERIC(14, 2) NOT NULL,
    offered_price NUMERIC(14, 2) NOT NULL,
    counter_price NUMERIC(14, 2),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, ACCEPTED, COUNTERED, DECLINED, EXPIRED, CANCELLED
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mkt_offer_product ON marketplace_offers(product_id);
CREATE INDEX idx_mkt_offer_buyer ON marketplace_offers(buyer_user_id);
CREATE INDEX idx_mkt_offer_seller ON marketplace_offers(seller_user_id);
```

### 2.8 `marketplace_orders`
Completed transactions with snapshotted gross amount and commission.

```sql
CREATE TABLE IF NOT EXISTS marketplace_orders (
    order_id BIGSERIAL PRIMARY KEY,
    order_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    product_id BIGINT NOT NULL REFERENCES marketplace_products(product_id),
    buyer_user_id BIGINT NOT NULL,
    seller_user_id BIGINT NOT NULL,
    shop_id BIGINT REFERENCES marketplace_shops(shop_id),
    seller_type VARCHAR(32) NOT NULL, -- INDIVIDUAL, SHOP
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    gross_amount NUMERIC(14, 2) NOT NULL,
    commission_rate NUMERIC(5, 2) NOT NULL,
    commission_amount NUMERIC(14, 2) NOT NULL,
    seller_net_amount NUMERIC(14, 2) NOT NULL,
    payment_mode VARCHAR(32) NOT NULL DEFAULT 'OFFLINE', -- ONLINE, OFFLINE, UPI, CASH
    payment_order_id BIGINT,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED', -- RESERVED, PAID, COMPLETED, CANCELLED, REFUNDED
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mkt_order_buyer ON marketplace_orders(buyer_user_id);
CREATE INDEX idx_mkt_order_seller ON marketplace_orders(seller_user_id);
```
