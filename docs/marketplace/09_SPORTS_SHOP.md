# 09. SPORTS SHOP ARCHITECTURE & STOREFRONT SPECIFICATION

> **Module**: Sports Shop Engine  
> **Status**: SPECIFIED & IMPLEMENTED  

---

## 1. Architectural Placement: Shop Is Not an Athlon Workspace

A Sports Shop in ATHLON is a specialized commercial sports retailer.
**It is NEVER added to the primary ATHLON workspace selector.**

### Navigation Pathway
```
ATHLON Market (Bottom Navigation)
  └── My Market (/market/my)
        └── My Sports Shops
              └── [ ABC SPORTS ]
                    ├── View Public Storefront (/market/shop/[shopId])
                    └── Manage Shop (/market/manage/[shopId])
```

---

## 2. Public Storefront Features (`/market/shop/[shopId]`)
- **Cover Banner & Store Logo**: High-definition branding.
- **Verification Seal**: Blue verified checkmark for approved retailers.
- **Store Telemetry**: Rating (e.g. 4.9 ★), review counts, total active products.
- **Contact Controls**: Direct call and email integration.
- **Product Catalog**: Live filterable grid of all items listed by the shop.

---

## 3. Shop Management Console (`/market/manage/[shopId]`)
- **Real-Time Dashboard**:
  - Today's Sales revenue (₹)
  - Daily order volume
  - Total active products in catalog
  - Low stock alerts (< 3 units)
  - Customer enquiries and price offers
- **Quick Action Bar**:
  - `+ Add Product` (SKU, brand, condition, multi-variants, inventory count)
  - `View Orders`
  - `Adjust Stock`
  - `View Public Profile`
