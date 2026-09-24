# 11. MARKETPLACE PERMISSION & AUTHORIZATION ARCHITECTURE

> **Module**: Access Control & Cross-Shop Security  
> **Status**: SPECIFIED  

---

## 1. Core Security Invariants

1. **Strict Ownership Control**:
   - Seller A cannot edit, pause, or delete Seller B's product.
   - Frontend cannot impersonate another seller ID; backend derives user identity strictly from verified JWT claims (`userId`, `userUuid`).
2. **Cross-Shop Isolation**:
   - Shop A staff cannot view or alter Shop B inventory, orders, or analytics.
   - Any attempt returns `403 Forbidden`.
3. **Price & Commission Tampering Protection**:
   - Buyers cannot manipulate the listed price.
   - Frontend cannot inject or override platform commission rates; commission is evaluated authoritatively on the backend upon order creation.
