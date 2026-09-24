# 16. MARKETPLACE SECURITY & ACCESS CONTROL SPECIFICATION

> **Module**: Platform Security  
> **Status**: SPECIFIED  

---

## 1. Security Protocols
- **JWT Authentication Guard**: All mutations (`createProduct`, `makeOffer`, `toggleWishlist`, `manageShop`) require valid bearer tokens.
- **Strict Role Boundaries**: Regular individual sellers cannot perform actions on behalf of verified sports shops.
- **Cross-Shop Access Prevention**: Backend rejects any request where the user's shop membership does not match the target `shopId`.
- **Idempotency & Race Condition Defense**: Single-quantity items use pessimistic/optimistic locking when moving to `RESERVED` upon offer acceptance to prevent double-sale.
