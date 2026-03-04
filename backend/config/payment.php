<?php

return [
    'provider' => env('PAYMENTS_PROVIDER', 'stub'),
    'mode' => env('PAYMENTS_MODE', 'test'),
    'currency' => env('PAYMENTS_CURRENCY', 'NGN'),
    'public_key' => env('PAYMENTS_PUBLIC_KEY'),
    'secret_key' => env('PAYMENTS_SECRET_KEY'),
    'webhook_secret' => env('PAYMENTS_WEBHOOK_SECRET'),
    'base_url' => env('PAYMENTS_BASE_URL'),
    'callback_url' => env('PAYMENTS_CALLBACK_URL'),
    'webhook_route' => env('PAYMENTS_WEBHOOK_ROUTE', '/api/payments/webhook'),
];
