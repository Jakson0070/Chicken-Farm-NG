# Chicken-Farm-NG Backend System Overview

This document explains how the system works end-to-end and the planned payment approach.

## How The System Works (End-to-End)
1. Users and roles
- Customers browse products, add to cart, place orders, and track order status.
- Admins manage products, categories, inventory, pricing, orders, and fulfillment.
- Optional staff roles can handle packing, delivery updates, and refunds.

2. Core data flow
- React app calls the Laravel API at `/api/...`.
- Laravel validates requests, applies business rules, saves to the database, and returns JSON.
- Auth is handled by Sanctum (cookie or token).
- Product images are stored locally in development and in object storage (e.g., S3) in production.

3. Key domain workflows
- Product lifecycle: create → publish → update → archive.
- Inventory: stock in/out → reserved on checkout → deducted on payment.
- Orders: cart → checkout → payment → order created → fulfillment → delivered.
- Payments: pending → paid → failed → refunded.
- Notifications: email/SMS for order updates (optional).

4. Integration points
- Frontend consumes API and handles auth flow.
- Payment gateway (future): Stripe/Paystack/Flutterwave or another provider.
- Email/SMS provider for receipts and status updates (optional).
- Storage for images and invoices.

## Payment Approach (Stub Now, Real Gateway Later)
Current development will use a stubbed payment flow, then later integrate a proper payment gateway when available.

Phase 1 (Now): Stubbed payments
- Simulate payment success/failure in the API.
- Allow testing the full order flow without a real gateway.
- Store payment status and reference values in the database.

Phase 2 (Later): Real gateway integration
- Replace the stub with a real provider integration.
- Add webhook handling for async payment updates.
- Maintain the same payment status model to minimize changes.

## Payment Gateway Environment (Prepared)
The backend reads payment gateway settings from environment variables:
- `PAYMENTS_PROVIDER` (default `stub`)
- `PAYMENTS_MODE` (`test` or `live`)
- `PAYMENTS_CURRENCY` (default `NGN`)
- `PAYMENTS_PUBLIC_KEY`, `PAYMENTS_SECRET_KEY`
- `PAYMENTS_WEBHOOK_SECRET`
- `PAYMENTS_BASE_URL`, `PAYMENTS_CALLBACK_URL`
- `PAYMENTS_WEBHOOK_ROUTE` (default `/api/payments/webhook`)
