<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Services\HistoryService;
use App\Services\InventoryService;
use App\Services\NotificationService;
use App\Services\PaymentGatewayService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncPayments extends Command
{
    protected $signature = 'payments:sync {--minutes=30 : Pending payments older than this many minutes}';
    protected $description = 'Poll payment gateways for pending transactions and update their status.';

    public function handle(
        PaymentGatewayService $gateway,
        InventoryService $inventory,
        NotificationService $notifications,
        HistoryService $history
    ): int {
        $minutes = (int) $this->option('minutes');
        $cutoff = now()->subMinutes($minutes);

        $pendingPayments = Payment::query()
            ->where('status', Payment::STATUS_PENDING)
            ->where('provider', 'monnify')
            ->where('created_at', '<', $cutoff)
            ->with('order.items.product')
            ->get();

        if ($pendingPayments->isEmpty()) {
            $this->info('No pending payments to sync.');
            return 0;
        }

        $this->info("Syncing {$pendingPayments->count()} pending payments...");

        foreach ($pendingPayments as $payment) {
            $this->syncPayment($payment, $gateway, $inventory, $notifications, $history);
        }

        return 0;
    }

    private function syncPayment(
        Payment $payment,
        PaymentGatewayService $gateway,
        InventoryService $inventory,
        NotificationService $notifications,
        HistoryService $history
    ): void {
        $transactionReference = data_get($payment->payload, 'transaction_reference')
            ?? data_get($payment->payload, 'raw.transactionReference');

        if (!$transactionReference) {
            $this->warn("Skipping payment #{$payment->id}: No transaction reference found.");
            return;
        }

        try {
            $this->info("Fetching status for payment #{$payment->id} (Ref: {$transactionReference})...");
            $statusPayload = $gateway->fetchTransactionStatus($transactionReference);
            $status = $statusPayload['status'];
            
            // Only update if the status is no longer pending
            if ($status === Payment::STATUS_PENDING) {
                $this->line("Payment #{$payment->id} is still pending at gateway.");
                return;
            }

            $reason = 'cron_sync';
            $payload = [
                'reference' => $statusPayload['reference'] ?? $payment->reference,
                'payload' => $statusPayload['payload'] ?? [],
            ];

            $this->applyStatus($payment, $status, $reason, $payload, $gateway, $inventory, $notifications, $history);
            $this->info("Successfully updated payment #{$payment->id} to {$status}.");

        } catch (\Throwable $exception) {
            $this->error("Failed to sync payment #{$payment->id}: " . $exception->getMessage());
            Log::error('Payment Sync Failed', [
                'payment_id' => $payment->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function applyStatus(
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
        }
    }
}
