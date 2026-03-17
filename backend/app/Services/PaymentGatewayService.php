<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentGatewayService
{
    public function createPaymentIntent(Order $order, float $amount): array
    {
        $provider = config('payment.provider', 'stub');

        Log::info('Creating Payment Intent', [
            'order_id' => $order->id,
            'amount' => $amount,
            'provider' => $provider,
        ]);

        if ($provider === 'monnify') {
            return $this->createMonnifyIntent($order, $amount);
        }

        return $this->createStubIntent($order);
    }

    public function verifyWebhook(Request $request): bool
    {
        if (config('payment.provider') === 'monnify') {
            $secret = config('payment.monnify.secret_key');
            if (!$secret) {
                return false;
            }

            $signature = $request->header('monnify-signature');
            if (!$signature) {
                return false;
            }

            $payload = (string) $request->getContent();
            $hash = hash('sha512', $secret . $payload);

            return hash_equals($hash, (string) $signature);
        }

        $secret = config('payment.webhook_secret');
        if (!$secret) {
            return true;
        }

        $signature = $request->header('X-Payment-Signature');
        return hash_equals($secret, (string) $signature);
    }

    public function parseWebhook(Request $request): array
    {
        if (config('payment.provider') === 'monnify') {
            $payload = $request->json()->all();
            $eventType = data_get($payload, 'eventType');
            $eventData = data_get($payload, 'eventData');

            if (!is_string($eventType) || !is_array($eventData)) {
                throw new \RuntimeException('Invalid Monnify webhook payload.');
            }

            $paymentReference = data_get($eventData, 'paymentReference');
            $transactionReference = data_get($eventData, 'transactionReference');
            $paymentStatus = data_get($eventData, 'paymentStatus');

            if (!$paymentReference) {
                throw new \RuntimeException('Missing Monnify payment reference.');
            }

            return [
                'reference' => $paymentReference,
                'transaction_reference' => $transactionReference,
                'status' => $this->normalizeMonnifyStatus($eventType, $paymentStatus),
                'payload' => $eventData,
                'reason' => 'monnify_' . strtolower($eventType),
            ];
        }

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

    public function refund(Payment $payment, ?string $reason = null): array
    {
        $provider = $payment->provider ?? config('payment.provider', 'stub');

        Log::info('Initiating Payment Refund', [
            'payment_id' => $payment->id,
            'amount' => $payment->amount,
            'provider' => $provider,
        ]);

        if ($provider === 'monnify') {
            return $this->refundMonnify($payment, $reason);
        }

        return [
            'status' => Payment::STATUS_REFUNDED,
            'reference' => $payment->reference,
            'payload' => ['refund_reason' => $reason],
        ];
    }

    private function refundMonnify(Payment $payment, ?string $reason = null): array
    {
        $apiKey = config('payment.monnify.api_key');
        $secretKey = config('payment.monnify.secret_key');
        $baseUrl = $this->monnifyBaseUrl();

        if (!$apiKey || !$secretKey || $baseUrl === '') {
            throw new \RuntimeException('Monnify credentials are not configured.');
        }

        $transactionReference = data_get($payment->payload, 'transaction_reference')
            ?? data_get($payment->payload, 'raw.transactionReference');

        if (!$transactionReference) {
            throw new \RuntimeException('Monnify transaction reference is missing.');
        }

        $accessToken = $this->monnifyAccessToken($apiKey, $secretKey, $baseUrl);

        try {
            $refundResponse = $this->monnifyHttp()
                ->withToken($accessToken)
                ->asJson()
                ->post($baseUrl . '/api/v1/refunds/initiate', [
                    'transactionReference' => $transactionReference,
                    'refundAmount' => round((float) $payment->amount, 2),
                    'refundReason' => $reason ?? 'Customer request',
                    'refundStrategy' => 'BACK_TO_SOURCE',
                ]);
        } catch (\Throwable $exception) {
            Log::error('Monnify Refund Request Failed', ['error' => $exception->getMessage()]);
            throw new \RuntimeException('Failed to initiate Monnify refund: ' . $exception->getMessage());
        }

        if (!$refundResponse->successful()) {
            Log::error('Monnify Refund Error Response', ['body' => $refundResponse->json()]);
            $message = data_get($refundResponse->json(), 'responseMessage')
                ?? $refundResponse->body()
                ?? 'Failed to initiate Monnify refund.';
            throw new \RuntimeException($message);
        }

        $payload = $refundResponse->json();
        Log::info('Monnify Refund Initiated', ['payload' => $payload]);

        return [
            'status' => Payment::STATUS_REFUNDED,
            'reference' => $payment->reference,
            'payload' => $payload['responseBody'] ?? [],
        ];
    }

    private function buildStubPaymentUrl(string $reference): string
    {
        $base = rtrim((string) config('payment.base_url', ''), '/');
        if ($base === '') {
            return 'stub://payment/' . $reference;
        }

        return $base . '/pay/' . $reference;
    }

    private function createStubIntent(Order $order): array
    {
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

    private function createMonnifyIntent(Order $order, float $amount): array
    {
        $apiKey = config('payment.monnify.api_key');
        $secretKey = config('payment.monnify.secret_key');
        $contractCode = config('payment.monnify.contract_code');
        $baseUrl = $this->monnifyBaseUrl();

        if (!$apiKey || !$secretKey || !$contractCode || $baseUrl === '') {
            throw new \RuntimeException('Monnify credentials are not configured.');
        }

        $customerEmail = (string) optional($order->user)->email;
        if ($customerEmail === '') {
            throw new \RuntimeException('Customer email is required for Monnify checkout.');
        }

        $customerName = trim((string) optional($order->user)->name);
        if ($customerName === '') {
            $customerName = 'Customer';
        }

        $reference = 'order_' . $order->id . '_' . Str::uuid()->toString();

        $accessToken = $this->monnifyAccessToken($apiKey, $secretKey, $baseUrl);

        $payload = [
            'amount' => round($amount, 2),
            'customerName' => $customerName,
            'customerEmail' => $customerEmail,
            'paymentReference' => $reference,
            'paymentDescription' => 'Order #' . $order->id,
            'currencyCode' => config('payment.currency', 'NGN'),
            'contractCode' => $contractCode,
            'redirectUrl' => config('payment.callback_url'),
            'paymentMethods' => $this->monnifyPaymentMethods(),
            'metaData' => [
                'order_id' => $order->id,
            ],
        ];

        Log::info('Monnify Transaction Init Payload', ['payload' => $payload]);

        try {
            $initResponse = $this->monnifyHttp()
                ->withToken($accessToken)
                ->asJson()
                ->post($baseUrl . '/api/v1/merchant/transactions/init-transaction', $payload);
        } catch (\Throwable $exception) {
            Log::error('Monnify Transaction Init Request Failed', ['error' => $exception->getMessage()]);
            throw new \RuntimeException('Failed to initialize Monnify transaction: ' . $exception->getMessage());
        }

        if (!$initResponse->successful()) {
            Log::error('Monnify Transaction Init Error Response', [
                'status' => $initResponse->status(),
                'body' => $initResponse->json(),
                'raw_body' => $initResponse->body(),
            ]);
            $message = data_get($initResponse->json(), 'responseMessage')
                ?? $initResponse->body()
                ?? 'Failed to initialize Monnify transaction.';
            throw new \RuntimeException($message);
        }

        $initPayload = $initResponse->json();
        if (!data_get($initPayload, 'requestSuccessful')) {
            Log::error('Monnify Transaction Init Refused', ['payload' => $initPayload]);
            $message = data_get($initPayload, 'responseMessage', 'Failed to initialize Monnify transaction.');
            throw new \RuntimeException($message);
        }

        $body = data_get($initPayload, 'responseBody', []);
        $checkoutUrl = data_get($body, 'checkoutUrl');
        if (!$checkoutUrl) {
            throw new \RuntimeException('Monnify did not return a checkout URL.');
        }

        return [
            'provider' => 'monnify',
            'reference' => $reference,
            'payment_url' => $checkoutUrl,
            'payload' => [
                'mode' => config('payment.mode', 'test'),
                'currency' => config('payment.currency', 'NGN'),
                'order_id' => $order->id,
                'payment_url' => $checkoutUrl,
                'payment_reference' => data_get($body, 'paymentReference', $reference),
                'transaction_reference' => data_get($body, 'transactionReference'),
                'raw' => $body,
            ],
        ];
    }

    public function fetchTransactionStatus(string $transactionReference): array
    {
        if (config('payment.provider') !== 'monnify') {
            throw new \RuntimeException('Unsupported payment provider.');
        }

        $apiKey = config('payment.monnify.api_key');
        $secretKey = config('payment.monnify.secret_key');
        $baseUrl = $this->monnifyBaseUrl();

        if (!$apiKey || !$secretKey || $baseUrl === '') {
            throw new \RuntimeException('Monnify credentials are not configured.');
        }

        $accessToken = $this->monnifyAccessToken($apiKey, $secretKey, $baseUrl);
        $encodedRef = rawurlencode($transactionReference);

        try {
            $statusResponse = $this->monnifyHttp()
                ->withToken($accessToken)
                ->get($baseUrl . '/api/v2/transactions/' . $encodedRef);
        } catch (\Throwable $exception) {
            Log::error('Monnify Fetch Transaction Request Failed', ['error' => $exception->getMessage()]);
            throw new \RuntimeException('Failed to fetch Monnify transaction status: ' . $exception->getMessage());
        }

        if (!$statusResponse->successful()) {
            Log::error('Monnify Fetch Transaction Error Response', ['body' => $statusResponse->json()]);
            $message = data_get($statusResponse->json(), 'responseMessage')
                ?? $statusResponse->body()
                ?? 'Failed to fetch Monnify transaction status.';
            throw new \RuntimeException($message);
        }

        $statusPayload = $statusResponse->json();
        if (!data_get($statusPayload, 'requestSuccessful')) {
            Log::error('Monnify Fetch Transaction Refused', ['payload' => $statusPayload]);
            $message = data_get($statusPayload, 'responseMessage', 'Failed to fetch Monnify transaction status.');
            throw new \RuntimeException($message);
        }

        $body = data_get($statusPayload, 'responseBody', []);
        $rawStatus = data_get($body, 'paymentStatus')
            ?? data_get($body, 'transactionStatus')
            ?? data_get($body, 'status');

        return [
            'status' => $this->normalizeMonnifyStatus(null, $rawStatus),
            'reference' => data_get($body, 'paymentReference'),
            'transaction_reference' => data_get($body, 'transactionReference'),
            'payload' => $body,
        ];
    }

    private function monnifyPaymentMethods(): array
    {
        $methods = config('payment.monnify.payment_methods', []);

        if (is_string($methods)) {
            $methods = array_filter(array_map('trim', explode(',', $methods)));
        }

        if (!is_array($methods)) {
            return [];
        }

        return array_values(array_filter($methods));
    }

    private function normalizeMonnifyStatus(?string $eventType, ?string $paymentStatus): string
    {
        $eventType = strtoupper((string) $eventType);
        $paymentStatus = strtoupper((string) $paymentStatus);

        if ($eventType === 'SUCCESSFUL_TRANSACTION') {
            return Payment::STATUS_PAID;
        }

        if (in_array($paymentStatus, ['PAID', 'OVERPAID'], true)) {
            return Payment::STATUS_PAID;
        }

        if ($eventType === 'FAILED_TRANSACTION') {
            return Payment::STATUS_FAILED;
        }

        if (in_array($paymentStatus, ['FAILED', 'EXPIRED', 'CANCELLED'], true)) {
            return Payment::STATUS_FAILED;
        }

        return 'pending';
    }

    private function monnifyAccessToken(string $apiKey, string $secretKey, string $baseUrl): string
    {
        try {
            $tokenResponse = $this->monnifyHttp()
                ->withHeaders([
                    'Authorization' => 'Basic ' . base64_encode($apiKey . ':' . $secretKey),
                ])
                ->post($baseUrl . '/api/v1/auth/login');
        } catch (\Throwable $exception) {
            throw new \RuntimeException('Failed to authenticate with Monnify: ' . $exception->getMessage());
        }

        if (!$tokenResponse->successful()) {
            $message = data_get($tokenResponse->json(), 'responseMessage')
                ?? $tokenResponse->body()
                ?? 'Failed to authenticate with Monnify.';
            throw new \RuntimeException($message);
        }

        $tokenPayload = $tokenResponse->json();
        if (!data_get($tokenPayload, 'requestSuccessful')) {
            throw new \RuntimeException('Failed to authenticate with Monnify.');
        }

        $accessToken = data_get($tokenPayload, 'responseBody.accessToken');
        if (!$accessToken) {
            throw new \RuntimeException('Monnify access token missing.');
        }

        return $accessToken;
    }

    private function monnifyHttp(): PendingRequest
    {
        return Http::acceptJson()
            ->timeout(30)
            ->retry(2, 500)
            ->withOptions([
                'verify' => true,
            ]);
    }

    private function monnifyBaseUrl(): string
    {
        $baseUrl = rtrim((string) config('payment.monnify.base_url', ''), '/');
        $mode = strtolower((string) config('payment.mode', 'test'));

        $validModes = ['test', 'live', 'prod', 'production'];
        if (!in_array($mode, $validModes, true)) {
            throw new \RuntimeException('Invalid payment mode: ' . $mode . '. Supported modes: ' . implode(', ', $validModes));
        }

        if ($baseUrl === '') {
            $baseUrl = $mode === 'test'
                ? 'https://sandbox.monnify.com'
                : 'https://api.monnify.com';
        }

        if ($mode === 'test' && str_contains($baseUrl, 'api.monnify.com')) {
            throw new \RuntimeException('Monnify base URL points to production while PAYMENTS_MODE=test. Use https://sandbox.monnify.com.');
        }

        if (in_array($mode, ['live', 'prod', 'production'], true) && str_contains($baseUrl, 'sandbox.monnify.com')) {
            throw new \RuntimeException('Monnify base URL points to sandbox while PAYMENTS_MODE=live. Use https://api.monnify.com.');
        }

        return $baseUrl;
    }
}
