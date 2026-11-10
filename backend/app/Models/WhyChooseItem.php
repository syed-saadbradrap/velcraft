<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhyChooseItem extends Model
{
    protected $fillable = [
        'title',
        'description',
        'icon',
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
