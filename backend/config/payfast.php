<?php

return [
    'merchant_id' => env('PAYFAST_MERCHANT_ID'),
    'secured_key' => env('PAYFAST_SECURED_KEY'),
    'merchant_name' => env('PAYFAST_MERCHANT_NAME', env('APP_NAME', 'Velcraft')),
    'mode' => env('PAYFAST_MODE', 'sandbox'),
    'sandbox_url' => env('PAYFAST_SANDBOX_URL', 'https://sandbox.payfast.com'),
    'live_url' => env('PAYFAST_LIVE_URL', 'https://api.payfast.com'),
    'frontend_url' => rtrim(env('FRONTEND_URL', 'http://localhost:3002'), '/'),
    'grant_type' => env('PAYFAST_GRANT_TYPE', 'client_credentials'),
    'version' => env('PAYFAST_VERSION', 'VELCRAFT-CHECKOUT-1.0'),
];
