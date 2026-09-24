# 12. MARKETPLACE PAYMENT & SETTLEMENT INTEGRATION

> **Module**: Payment Integration  
> **Status**: SPECIFIED  

---

## 1. Central Payment Architecture

Marketplace integrates with the centralized `PAYMENTSERVICE` (port 5054) via Gateway route `/api/payments/*`:
- Subscription payments (`MARKETPLACE_SELLER_SUBSCRIPTION`, `MARKETPLACE_SHOP_SUBSCRIPTION`) flow through `PaymentOrderController` with Razorpay orders.
- Direct product purchases in V1 utilize direct community settlement, offer reservation, and offline/cash-on-delivery tracking with commission snapshots.
- Future online settlement will trigger automatic Razorpay Route vendor splits using `RazorpayRouteClient`.
