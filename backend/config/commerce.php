<?php

return [

    'default_country' => env('COMMERCE_DEFAULT_COUNTRY', 'PK'),

    'currency' => env('COMMERCE_CURRENCY', 'pkr'),

    'shipping_amount' => (float) env('COMMERCE_SHIPPING_AMOUNT', 2500),

    'order_number_prefix' => env('COMMERCE_ORDER_PREFIX', 'CS'),

];
