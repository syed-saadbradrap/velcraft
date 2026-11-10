<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $fillable = [
        'cart_id',
        'shoe_id',
        'quantity',
        'customization',
        'unit_price',
    ];

    protected function casts(): array
    {
        return [
            'customization' => 'array',
            'unit_price' => 'decimal:2',
        ];
    }

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function shoe(): BelongsTo
    {
        return $this->belongsTo(Shoe::class);
    }

    public function lineTotal(): float
    {
        return round((float) $this->unit_price * $this->quantity, 2);
    }
}
