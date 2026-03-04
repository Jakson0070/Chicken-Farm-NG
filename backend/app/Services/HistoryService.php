<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Payment;
use App\Models\PaymentStatusHistory;
use App\Models\Product;
use App\Models\ProductHistory;

class HistoryService
{
    public function orderStatus(
        Order $order,
        ?int $userId,
        ?string $fromStatus,
        string $toStatus,
        ?string $reason = null,
        ?string $notes = null,
        array $payload = []
    ): OrderStatusHistory {
        return OrderStatusHistory::create([
            'order_id' => $order->id,
            'user_id' => $userId,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'reason' => $reason,
            'notes' => $notes,
            'payload' => $payload ?: null,
        ]);
    }

    public function paymentStatus(
        Payment $payment,
        ?int $userId,
        ?string $fromStatus,
        string $toStatus,
        ?string $reason = null,
        array $payload = []
    ): PaymentStatusHistory {
        return PaymentStatusHistory::create([
            'payment_id' => $payment->id,
            'user_id' => $userId,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'reason' => $reason,
            'payload' => $payload ?: null,
        ]);
    }

    public function product(
        Product $product,
        ?int $userId,
        string $action,
        array $changes = [],
        array $snapshot = []
    ): ProductHistory {
        return ProductHistory::create([
            'product_id' => $product->id,
            'user_id' => $userId,
            'action' => $action,
            'changes' => $changes ?: null,
            'snapshot' => $snapshot ?: null,
        ]);
    }
}
