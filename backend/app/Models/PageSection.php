<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageSection extends Model
{
    protected $fillable = [
        'page_key',
        'section_key',
        'eyebrow',
        'title',
        'description',
        'body_json',
        'image_path',
        'cta_label',
        'cta_url',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'body_json' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
