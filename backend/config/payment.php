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
    'monnify' => [
        'api_key' => env('MONNIFY_API_KEY'),
        'secret_key' => env('MONNIFY_SECRET_KEY'),
        'contract_code' => env('MONNIFY_CONTRACT_CODE'),
        'base_url' => env('MONNIFY_BASE_URL', 'https://sandbox.monnify.com'),
        'payment_methods' => env('MONNIFY_PAYMENT_METHODS', 'CARD,ACCOUNT_TRANSFER'),
    ],
];
