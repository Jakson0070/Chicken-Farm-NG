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
use Illuminate\Support\Facades\Log;

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
        PaymentGatewayService $gateway,
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

        try {
            $refundResult = $gateway->refund($payment, $request->input('reason'));
        } catch (\RuntimeException $exception) {
            return response()->json([
                'message' => 'Gateway refund failed: ' . $exception->getMessage(),
            ], 422);
        }

        DB::transaction(function () use ($payment, $inventory, $history, $refundResult) {
            $order = $payment->order()->with('items.product')->firstOrFail();
            $previousOrderStatus = $order->status;
            $previousPaymentStatus = $payment->status;

            if (in_array($order->status, [Order::STATUS_PAID, Order::STATUS_FULFILLMENT], true)) {
                foreach ($order->items as $item) {
                    $inventory->stockIn($item->product, (float) $item->quantity, $item->batch, auth()->id(), 'refund');
                }
            }

            $payment->status = Payment::STATUS_REFUNDED;
            $payment->payload = array_merge($payment->payload ?? [], $refundResult['payload'] ?? []);
            $payment->save();

            $order->status = Order::STATUS_CANCELLED;
            $order->save();

            $history->paymentStatus($payment, auth()->id(), $previousPaymentStatus, $payment->status, 'manual_refund', $refundResult['payload'] ?? []);
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
        Log::info('Payment Webhook Received', [
            'headers' => $request->headers->all(),
            'payload' => $request->all(),
        ]);

        if (!$gateway->verifyWebhook($request)) {
            Log::warning('Payment Webhook Signature Invalid', [
                'payload' => $request->all(),
            ]);
            return response()->json([
                'message' => 'Invalid signature.',
            ], 401);
        }

        try {
            $payload = $gateway->parseWebhook($request);
        } catch (\RuntimeException $exception) {
            Log::error('Payment Webhook Parse Failed', [
                'error' => $exception->getMessage(),
                'payload' => $request->all(),
            ]);
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        if (!empty($payload['payment_id'])) {
            $payment = Payment::query()
                ->with('order.items.product')
                ->find($payload['payment_id']);
        } elseif (!empty($payload['reference'])) {
            $payment = Payment::query()
                ->with('order.items.product')
                ->where('reference', $payload['reference'])
                ->first();
        } else {
            return response()->json([
                'message' => 'Unable to resolve payment reference.',
            ], 422);
        }

        if (!$payment) {
            Log::warning('Payment Webhook: Payment not found', ['payload' => $payload]);
            return response()->json(['message' => 'Payment not found.'], 404);
        }

        if ($payment->status !== Payment::STATUS_PENDING) {
            Log::info('Payment Webhook: Payment already processed', [
                'payment_id' => $payment->id,
                'status' => $payment->status,
            ]);
            return response()->json([
                'message' => 'Payment already processed.',
                'payment' => $payment,
            ]);
        }

        $status = $payload['status'];
        $reason = $payload['reason'] ?? 'gateway_webhook';

        try {
            $this->applyGatewayStatus($payment, $status, $reason, $payload, $gateway, $inventory, $notifications, $history);
        } catch (\RuntimeException $exception) {
            Log::error('Payment Webhook: Error applying status', [
                'error' => $exception->getMessage(),
                'payment_id' => $payment->id,
            ]);
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Webhook processed',
            'payment' => $payment->fresh('order.items.product'),
        ]);
    }

    public function callback(
        Request $request,
        PaymentGatewayService $gateway,
        InventoryService $inventory,
        NotificationService $notifications,
        HistoryService $history
    ): JsonResponse {
        Log::info('Payment Callback Received', [
            'query' => $request->query(),
        ]);

        if (config('payment.provider') !== 'monnify') {
            return response()->json([
                'message' => 'Unsupported payment provider.',
            ], 422);
        }

        $paymentReference = $request->query('paymentReference')
            ?? $request->query('payment_reference')
            ?? $request->query('reference');
        $transactionReference = $request->query('transactionReference')
            ?? $request->query('transaction_reference');

        $payment = null;
        if ($paymentReference) {
            $payment = Payment::query()
                ->with('order.items.product')
                ->where('reference', $paymentReference)
                ->first();
        }

        if (!$payment && $transactionReference) {
            $payment = Payment::query()
                ->with('order.items.product')
                ->where('status', Payment::STATUS_PENDING)
                ->get()
                ->first(function (Payment $candidate) use ($transactionReference) {
                    $payload = $candidate->payload ?? [];
                    return data_get($payload, 'transaction_reference') === $transactionReference
                        || data_get($payload, 'raw.transactionReference') === $transactionReference;
                });
        }

        if (!$payment) {
            Log::warning('Payment Callback: Payment not found', [
                'paymentReference' => $paymentReference,
                'transactionReference' => $transactionReference,
            ]);
            return response()->json([
                'message' => 'Payment not found.',
            ], 404);
        }

        if ($payment->status !== Payment::STATUS_PENDING) {
            Log::info('Payment Callback: Payment already processed', [
                'payment_id' => $payment->id,
                'status' => $payment->status,
            ]);
            return response()->json([
                'message' => 'Payment already processed.',
                'payment' => $payment,
            ]);
        }

        $transactionReference = $transactionReference
            ?? data_get($payment->payload, 'transaction_reference')
            ?? data_get($payment->payload, 'raw.transactionReference');

        if (!$transactionReference) {
            return response()->json([
                'message' => 'Missing transaction reference.',
                'payment' => $payment,
            ], 422);
        }

        try {
            $statusPayload = $gateway->fetchTransactionStatus($transactionReference);
            $status = $statusPayload['status'];
            $reason = 'monnify_callback';
            $payload = [
                'reference' => $statusPayload['reference'] ?? $payment->reference,
                'payload' => $statusPayload['payload'] ?? [],
            ];

            $this->applyGatewayStatus($payment, $status, $reason, $payload, $gateway, $inventory, $notifications, $history);
        } catch (\RuntimeException $exception) {
            Log::error('Payment Callback: Status fetch failed', [
                'error' => $exception->getMessage(),
                'payment_id' => $payment->id,
            ]);
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Payment callback processed.',
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

    private function applyGatewayStatus(
        Payment $payment,
        string $status,
        string $reason,
        array $payload,
        PaymentGatewayService $gateway,
        InventoryService $inventory,
        NotificationService $notifications,
        HistoryService $history
    ): void {
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

            return;
        }

        if ($gateway->isFailed($status)) {
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

            return;
        }

        throw new \RuntimeException('Unsupported status.');
    }
}
