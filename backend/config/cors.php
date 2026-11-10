<?php

return [
    // Empty API_PREFIX means routes live at /v1/* (public_html/api strips /api).
    'paths' => ['api/*', 'v1/*', '*'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => array_values(array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3002'))))),
    'allowed_origins_patterns' => [
        '#^https://.*\.vercel\.app$#',
    ],
    'allowed_headers' => [
        'Authorization',
        'Content-Type',
        'Accept',
        'X-Requested-With',
        'X-Guest-Token',
        'X-Guest-Checkout-Token',
    ],
    'exposed_headers' => [],
    'max_age' => 3600,
    'supports_credentials' => false,
];
