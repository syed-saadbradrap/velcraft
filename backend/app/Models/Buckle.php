<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Buckle extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'model_path',
        'thumbnail_path',
        'price_modifier',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price_modifier' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function shoes(): BelongsToMany
    {
        return $this->belongsToMany(Shoe::class);
    }
}
