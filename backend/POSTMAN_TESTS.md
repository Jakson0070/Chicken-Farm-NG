
## Postmantesting 
Below is a complete Postman test matrix for all current endpoints. I’ll assume base URL http://localhost:8000/api. Re
  place as needed.

  Use Authorization: Bearer <token> for protected routes.

  Auth

  1. POST /auth/register

  {"name":"Test User","email":"testuser@chickenfarm.ng","password":"password123","password_confirmation":"password123"}

  Expect: 201 + token/user.

  2. POST /auth/login

  {"email":"admin@chickenfarm.ng","password":"password123"}

  Expect: 200 + token.

  3. GET /auth/me (auth)
     Expect: 200 user payload.
  4. POST /auth/logout (auth)
     Expect: 200 message.

  Public products
  5. GET /products
  Expect: 200 paginated list (only published).

  6. GET /products?type=feed
     Expect: 200 filtered list.
  7. GET /products/{id} (use a published product)
     Expect: 200 product.

  Admin products (admin token)
  8. GET /admin/products
  Expect: 200 list (all statuses).

  9. POST /admin/products

  {"name":"Layer Chicken","description":"Healthy
  layers","type":"livestock","unit":"piece","pack_size":1,"price":4200,"is_preorder":false,"is_seasonal":false,"requires
  _cold_chain":true}

  Expect: 201 draft product.

  10. POST /admin/products/{id}/publish
     Expect: 200 status=published.
  11. PUT /admin/products/{id}

  {"price":4500,"description":"Updated description"}

  Expect: 200 updated product.

  12. POST /admin/products/{id}/archive
     Expect: 200 status=archived.
  13. PUT /admin/products/{id} (archived)
     Expect: 422 error.
  14. POST /admin/products/{id}/unarchive
     Expect: 200 status=draft.

  Admin inventory (admin token)
  15. POST /admin/inventory/stock-in

  {"product_id":1,"quantity":10,"batch_code":"B-2026-03","harvested_at":"2026-03-01","expires_at":"2026-04-
  01","reason":"harvest"}

  Expect: 200 product with higher stock_on_hand.

  16. POST /admin/inventory/stock-out

  {"product_id":1,"quantity":2,"batch_code":"B-2026-03","reason":"spoilage"}

  Expect: 200 stock_on_hand reduced.

  17. POST /admin/inventory/adjust

  {"product_id":1,"new_stock_on_hand":50,"batch_code":"B-2026-03","reason":"audit"}

  Expect: 200 stock_on_hand = 50.

  Cart (user token)
  18. GET /cart
  Expect: 200 cart (status=cart).

  19. POST /cart/items

  {"product_id":1,"quantity":2}

  Expect: 200 cart with item.

  20. PUT /cart/items/{itemId}

  {"quantity":3}

  Expect: 200 updated quantity.

  21. DELETE /cart/items/{itemId}
     Expect: 200 cart with item removed.

  Checkout & Orders (user token)
  22. POST /cart/items (add at least 1 item)
  Same as step 19.

  23. POST /checkout

  {"delivery_method":"local_delivery","delivery_address":"Farm Road, Kaduna","notes":"Handle with care"}

  Expect: 200 order status=pending_payment, payment created.

  24. GET /orders
     Expect: 200 list (non-cart).
  25. GET /orders/{orderId}
     Expect: 200 order details.

  Payments (admin token)
  26. POST /admin/payments/{paymentId}/confirm
  Expect: 200 payment status=paid, order status=paid.

  27. POST /admin/payments/{paymentId}/fail
     Expect: 200 payment status=failed, order status=cancelled, reserved released.
  28. POST /admin/payments/{paymentId}/refund
     Expect: 200 payment status=refunded, order cancelled, stock restored (if not dispatched).

  Admin orders (admin token)
  29. GET /admin/orders
  Expect: 200 list.

  30. GET /admin/orders/{orderId}
     Expect: 200 order with items/payments.
  31. PATCH /admin/orders/{orderId}/status

  {"status":"fulfillment"}

  Expect: 200 updated status.
  32. GET /admin/orders/{orderId}/history
     Expect: 200 paginated order status history.

  Admin users (admin token)
  33. GET /admin/users
  Expect: 200 list.

  34. GET /admin/users/{userId}

  {"name":"Updated Name"}


     Expect: 200 role=admin.
  39. DELETE /admin/users/{userId} (not self)
     Expect: 200 deleted.

  Payments history (admin token)
  40. GET /admin/payments/{paymentId}/history
     Expect: 200 payment status history.

  Products history (admin token)
  41. GET /admin/products/{productId}/history
     Expect: 200 product history.

  Payments webhook (gateway)
  42. POST /payments/webhook
  {"payment_id":1,"status":"paid","reference":"stub_ref","payload":{"gateway":"stub"}}
     Expect: 200 webhook processed.
