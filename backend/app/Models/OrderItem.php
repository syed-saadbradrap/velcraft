<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'shoe_id',
        'shoe_name',
        'quantity',
        'customization',
        'unit_price',
        'total_price',
    ];

    protected function casts(): array
    {
        return [
            'customization' => 'array',
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function shoe(): BelongsTo
    {
        return $this->belongsTo(Shoe::class);
    }
}
