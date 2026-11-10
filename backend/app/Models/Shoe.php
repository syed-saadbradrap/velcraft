<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Shoe extends Model
{
    protected $fillable = [
        'collection_id',
        'name',
        'slug',
        'description',
        'base_price',
        'thumbnail_path',
        'body_model_path',
        'sole_model_path',
        'logo_model_path',
        'inner_model_path',
        'default_buckle_model_path',
        'supported_types',
        'is_featured',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'supported_types' => 'array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    public function materials(): BelongsToMany
    {
        return $this->belongsToMany(Material::class);
    }

    public function colors(): BelongsToMany
    {
        return $this->belongsToMany(Color::class);
    }

    public function buckles(): BelongsToMany
    {
        return $this->belongsToMany(Buckle::class);
    }

    public function sizes(): BelongsToMany
    {
        return $this->belongsToMany(Size::class);
    }
}
