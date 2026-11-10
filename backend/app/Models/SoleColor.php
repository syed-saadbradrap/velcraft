<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoleColor extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'hex_code',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
