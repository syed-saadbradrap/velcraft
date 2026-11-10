<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WishlistItem extends Model
{
    protected $fillable = [
        'user_id',
        'shoe_id',
        'customization',
    ];

    protected function casts(): array
    {
        return [
            'customization' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shoe(): BelongsTo
    {
        return $this->belongsTo(Shoe::class);
    }
}
