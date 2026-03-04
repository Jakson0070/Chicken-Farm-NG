# Chicken-Farm E-Commerce Domain Plan

## Scope
Product lifecycle, inventory, orders, payments, and notifications tailored for agricultural/farm goods: livestock, eggs, feeds, seedlings, produce, fertilizers, and farm tools.

## Business Assumptions
- Items can be per-unit, per-weight, or per-pack.
- Some products are seasonal or pre-order (e.g., chicks, seedlings).
- Inventory may have batches (harvest date, expiry).
- Delivery can be local or nationwide; fulfillment steps may vary.

## Plan
1. Product lifecycle (farm-specific)
- Add `status`: `draft`, `published`, `archived`.
- Add product types: `livestock`, `produce`, `feed`, `equipment`, `seedlings`, `fertilizer`.
- Add flags: `is_preorder`, `is_seasonal`, `requires_cold_chain`.
- Add `unit` + `pack_size` (`kg`, `g`, `dozen`, `bag`, `crate`, `piece`).
- Admin transitions: create ? publish ? update ? archive.
- Prevent edits to archived products (except unarchive).

2. Inventory & batches
- Add `stock_on_hand`, `stock_reserved` (available = on_hand - reserved).
- Introduce `inventory_batches` for farm goods (batch code, harvest/production date, expiry).
- Stock in/out tracked with `inventory_movements` (reason: harvest, purchase, spoilage, adjustment, sale, return).
- Reserve stock on checkout; deduct on payment; release on payment failure/expiry.
- Optional: FIFO depletion by batch with expiry awareness.

3. Cart ? Order workflow
- States: `cart`, `pending_payment`, `paid`, `fulfillment`, `delivered`, `cancelled`.
- Checkout validates availability, delivery method, and any cold-chain restrictions.
- Order created on successful payment; mark items with batch allocation if applicable.
- Fulfillment updates: `packed` ? `dispatched` ? `delivered`.

4. Payments
- Status: `pending`, `paid`, `failed`, `refunded`.
- Payment callback/webhook updates order + inventory.
- Refund flow: restock if not dispatched; otherwise create return flow.

5. Notifications
- Email for order status, payment status, and delivery updates.
- Optional SMS for delivery and payment confirmation.
- Queue notifications for reliability.

6. API + Data changes
- Migrations for fields/tables above.
- Service layer for transitions (ProductService, InventoryService, OrderService, PaymentService).
- Policies for admin-only product publish/archive.

7. Tests
- Product lifecycle transitions.
- Inventory reserve/deduct/release with batch selection.
- Checkout validations for stock + cold-chain.
- Payment success/failure/refund behavior.
