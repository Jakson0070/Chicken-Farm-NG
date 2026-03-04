<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentGatewayService
{
    public function createPaymentIntent(Order $order, float $amount): array
    {
        // Stubbed response: replace with real gateway integration later.
        $reference = 'stub_' . Str::uuid()->toString();

        $paymentUrl = $this->buildStubPaymentUrl($reference);

        return [
            'provider' => config('payment.provider', 'stub'),
            'reference' => $reference,
            'payment_url' => $paymentUrl,
            'payload' => [
                'mode' => config('payment.mode', 'test'),
                'currency' => config('payment.currency', 'NGN'),
                'order_id' => $order->id,
                'payment_url' => $paymentUrl,
            ],
        ];
    }

    public function verifyWebhook(Request $request): bool
    {
        $secret = config('payment.webhook_secret');
        if (!$secret) {
            return true;
        }

        $signature = $request->header('X-Payment-Signature');
        return hash_equals($secret, (string) $signature);
    }

    public function parseWebhook(Request $request): array
    {
        return $request->validate([
            'payment_id' => ['required', 'integer', 'exists:payments,id'],
            'status' => ['required', 'string'],
            'reference' => ['nullable', 'string'],
            'payload' => ['nullable', 'array'],
            'reason' => ['nullable', 'string'],
        ]);
    }

    public function isPaid(string $status): bool
    {
        return $status === Payment::STATUS_PAID;
    }

    public function isFailed(string $status): bool
    {
        return $status === Payment::STATUS_FAILED;
    }

    public function isRefunded(string $status): bool
    {
        return $status === Payment::STATUS_REFUNDED;
    }

    private function buildStubPaymentUrl(string $reference): string
    {
        $base = rtrim((string) config('payment.base_url', ''), '/');
        if ($base === '') {
            return 'stub://payment/' . $reference;
        }

        return $base . '/pay/' . $reference;
    }
}
