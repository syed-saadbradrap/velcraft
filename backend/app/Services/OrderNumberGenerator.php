<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Str;

class OrderNumberGenerator
{
    public function generate(): string
    {
        $prefix = config('commerce.order_number_prefix', 'CS');
        $date = now()->format('Ymd');

        do {
            $suffix = Str::upper(Str::random(6));
            $orderNumber = sprintf('%s-%s-%s', $prefix, $date, $suffix);
        } while (Order::query()->where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}
