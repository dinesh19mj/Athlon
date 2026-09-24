# 04. MARKETPLACE REST API SPECIFICATION

> **Base Route**: `/api/identity/marketplace`  
> **Status**: SPECIFIED & CLIENT CLIENT IMPLEMENTED  

---

## 1. Endpoints

### 1.1 Products
- `GET /products?sport={sport}&category={cat}&condition={cond}&q={search}&sellerType={type}&maxPrice={price}`
  - Returns paginated list of market products.
- `GET /products/{id}`
  - Returns full product details, specs, seller info, and images.
- `POST /products`
  - Creates a new product listing (Individual or Shop). Requires auth.
- `PATCH /products/{id}`
  - Updates an existing product listing. Authorized seller/shop owner only.
- `DELETE /products/{id}`
  - Deletes or archives a product listing.

### 1.2 Categories & Shops
- `GET /categories`
  - Returns multi-sport category taxonomy.
- `GET /shops`
  - Returns registered commercial sports shops.
- `GET /shops/{shopId}`
  - Returns public shop profile and metadata.

### 1.3 Eligibility & Selling Gateway
- `GET /seller/eligibility`
  - Authoritatively checks user tournament count and subscription status.
  - Returns `eligible: boolean`, `sellerMode: 'COMMISSION'|'SUBSCRIPTION'|'SHOP'`, `count`, `required`.

### 1.4 Consumer Actions
- `POST /offers`
  - Submits a price offer for a negotiable product.
- `GET /wishlist`
  - Returns user saved items.
- `POST /wishlist/{productId}/toggle`
  - Adds or removes product from user wishlist.
