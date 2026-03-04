<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Services\HistoryService;
use App\Services\InventoryService;
use App\Services\NotificationService;
use App\Services\PaymentGatewayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function confirm(
        Request $request,
        Payment $payment,
        InventoryService $inventory,
        NotificationService $notifications,
        HistoryService $history
    ): JsonResponse
    {
        if ($payment->status !== Payment::STATUS_PENDING) {
            return response()->json([
                'message' => 'Payment is not pending.',
            ], 422);
        }

        DB::transaction(function () use ($payment, $inventory, $history) {
            $order = $payment->order()->with('items.product')->firstOrFail();
            $previousOrderStatus = $order->status;
            $previousPaymentStatus = $payment->status;

            foreach ($order->items as $item) {
                $inventory->deductReserved($item->product, (float) $item->quantity, $item->batch, auth()->id());
            }

            $payment->status = Payment::STATUS_PAID;
            $payment->paid_at = now();
            $payment->save();

            $order->status = Order::STATUS_PAID;
            $order->save();

            $history->paymentStatus($payment, auth()->id(), $previousPaymentStatus, $payment->status, 'manual_confirm');
            $history->orderStatus($order, auth()->id(), $previousOrderStatus, $order->status, 'payment_confirmed');
        });

        $payment->load('order.items.product');
        $notifications->orderEvent($payment->order, 'payment_paid', [
            'order_id' => $payment->order_id,
            'amount' => $payment->amount,
        ]);

        return response()->json([
            'message' => 'Payment confirmed',
            'payment' => $payment,
        ]);
    }

    public function fail(
        Request $request,
        Payment $payment,
        InventoryService $inventory,
        NotificationService $notifications,
        HistoryService $history
    ): JsonResponse
    {
        if ($payment->status !== Payment::STATUS_PENDING) {
            return response()->json([
                'message' => 'Payment is not pending.',
            ], 422);
        }

        DB::transaction(function () use ($payment, $inventory, $history) {
            $order = $payment->order()->with('items.product')->firstOrFail();
            $previousOrderStatus = $order->status;
            $previousPaymentStatus = $payment->status;

            foreach ($order->items as $item) {
                $inventory->release($item->product, (float) $item->quantity, $item->batch, auth()->id());
            }

            $payment->status = Payment::STATUS_FAILED;
            $payment->save();

            $order->status = Order::STATUS_CANCELLED;
            $order->save();

            $history->paymentStatus($payment, auth()->id(), $previousPaymentStatus, $payment->status, 'manual_fail');
            $history->orderStatus($order, auth()->id(), $previousOrderStatus, $order->status, 'payment_failed');
        });

        $payment->load('order.items.product');
        $notifications->orderEvent($payment->order, 'payment_failed', [
            'order_id' => $payment->order_id,
            'amount' => $payment->amount,
        ]);

        return response()->json([
            'message' => 'Payment marked as failed',
            'payment' => $payment,
        ]);
    }

    public function refund(
        Request $request,
        Payment $payment,
        InventoryService $inventory,
        NotificationService $notifications,
        HistoryService $history
    ): JsonResponse
    {
        if ($payment->status !== Payment::STATUS_PAID) {
            return response()->json([
                'message' => 'Only paid payments can be refunded.',
            ], 422);
        }

        DB::transaction(function () use ($payment, $inventory, $history) {
            $order = $payment->order()->with('items.product')->firstOrFail();
            $previousOrderStatus = $order->status;
            $previousPaymentStatus = $payment->status;

            if (in_array($order->status, [Order::STATUS_PAID, Order::STATUS_FULFILLMENT], true)) {
                foreach ($order->items as $item) {
                    $inventory->stockIn($item->product, (float) $item->quantity, $item->batch, auth()->id(), 'refund');
                }
            }

            $payment->status = Payment::STATUS_REFUNDED;
            $payment->save();

            $order->status = Order::STATUS_CANCELLED;
            $order->save();

            $history->paymentStatus($payment, auth()->id(), $previousPaymentStatus, $payment->status, 'manual_refund');
            $history->orderStatus($order, auth()->id(), $previousOrderStatus, $order->status, 'payment_refunded');
        });

        $payment->load('order.items.product');
        $notifications->orderEvent($payment->order, 'payment_refunded', [
            'order_id' => $payment->order_id,
            'amount' => $payment->amount,
        ]);

        return response()->json([
            'message' => 'Payment refunded',
            'payment' => $payment,
        ]);
    }

    public function webhook(
        Request $request,
        PaymentGatewayService $gateway,
        InventoryService $inventory,
        NotificationService $notifications,
        HistoryService $history
    ): JsonResponse {
        if (!$gateway->verifyWebhook($request)) {
            return response()->json([
                'message' => 'Invalid signature.',
            ], 401);
        }

        $payload = $gateway->parseWebhook($request);
        $payment = Payment::query()->with('order.items.product')->findOrFail($payload['payment_id']);

        if ($payment->status !== Payment::STATUS_PENDING) {
            return response()->json([
                'message' => 'Payment is not pending.',
            ], 422);
        }

        $status = $payload['status'];
        $reason = $payload['reason'] ?? 'gateway_webhook';

        if ($gateway->isPaid($status)) {
            DB::transaction(function () use ($payment, $inventory, $history, $reason, $payload) {
                $order = $payment->order;
                $previousOrderStatus = $order->status;
                $previousPaymentStatus = $payment->status;

                foreach ($order->items as $item) {
                    $inventory->deductReserved($item->product, (float) $item->quantity, $item->batch, null);
                }

                $payment->status = Payment::STATUS_PAID;
                $payment->paid_at = now();
                $payment->reference = $payload['reference'] ?? $payment->reference;
                $payment->payload = array_merge($payment->payload ?? [], $payload['payload'] ?? []);
                $payment->save();

                $order->status = Order::STATUS_PAID;
                $order->save();

                $history->paymentStatus($payment, null, $previousPaymentStatus, $payment->status, $reason, $payload);
                $history->orderStatus($order, null, $previousOrderStatus, $order->status, $reason, null, $payload);
            });

            $notifications->orderEvent($payment->order, 'payment_paid', [
                'order_id' => $payment->order_id,
                'amount' => $payment->amount,
            ]);
        } elseif ($gateway->isFailed($status)) {
            DB::transaction(function () use ($payment, $inventory, $history, $reason, $payload) {
                $order = $payment->order;
                $previousOrderStatus = $order->status;
                $previousPaymentStatus = $payment->status;

                foreach ($order->items as $item) {
                    $inventory->release($item->product, (float) $item->quantity, $item->batch, null);
                }

                $payment->status = Payment::STATUS_FAILED;
                $payment->reference = $payload['reference'] ?? $payment->reference;
                $payment->payload = array_merge($payment->payload ?? [], $payload['payload'] ?? []);
                $payment->save();

                $order->status = Order::STATUS_CANCELLED;
                $order->save();

                $history->paymentStatus($payment, null, $previousPaymentStatus, $payment->status, $reason, $payload);
                $history->orderStatus($order, null, $previousOrderStatus, $order->status, $reason, null, $payload);
            });

            $notifications->orderEvent($payment->order, 'payment_failed', [
                'order_id' => $payment->order_id,
                'amount' => $payment->amount,
            ]);
        } else {
            return response()->json([
                'message' => 'Unsupported status.',
            ], 422);
        }

        return response()->json([
            'message' => 'Webhook processed',
            'payment' => $payment->fresh('order.items.product'),
        ]);
    }

    public function history(Payment $payment): JsonResponse
    {
        $history = $payment->statusHistories()
            ->with('user')
            ->latest()
            ->paginate(25);

        return response()->json($history);
    }
}
