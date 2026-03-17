<?php

return [
    'tax_rate' => (float) env('TAX_RATE', 0),
    'shipping_flat' => (float) env('SHIPPING_FLAT', 0),
    'discount_rate' => (float) env('DISCOUNT_RATE', 0),
    'discount_flat' => (float) env('DISCOUNT_FLAT', 0),
    'default_delivery_method' => env('DEFAULT_DELIVERY_METHOD', 'local_delivery'),
];
