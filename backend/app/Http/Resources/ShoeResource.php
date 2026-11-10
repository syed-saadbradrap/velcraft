<?php

namespace App\Http\Resources;

use App\Models\SoleColor;
use App\Support\AssetUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Shoe */
class ShoeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = str_starts_with($request->path(), 'api/v1/admin');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'base_price' => (float) $this->base_price,
            'thumbnail_url' => AssetUrl::publicUrl($this->thumbnail_path),
            'is_featured' => $this->is_featured,
            'is_active' => $this->when($isAdmin, $this->is_active),
            'sort_order' => $this->when($isAdmin, $this->sort_order),
            'collection_id' => $this->when($isAdmin, $this->collection_id),
            'thumbnail_path' => $this->when($isAdmin, $this->thumbnail_path),
            'body_model_path' => $this->when($isAdmin, $this->body_model_path),
            'sole_model_path' => $this->when($isAdmin, $this->sole_model_path),
            'logo_model_path' => $this->when($isAdmin, $this->logo_model_path),
            'inner_model_path' => $this->when($isAdmin, $this->inner_model_path),
            'default_buckle_model_path' => $this->when($isAdmin, $this->default_buckle_model_path),
            'material_ids' => $this->when(
                $isAdmin && $this->relationLoaded('materials'),
                fn () => $this->materials->pluck('id')->values(),
            ),
            'color_ids' => $this->when(
                $isAdmin && $this->relationLoaded('colors'),
                fn () => $this->colors->pluck('id')->values(),
            ),
            'buckle_ids' => $this->when(
                $isAdmin && $this->relationLoaded('buckles'),
                fn () => $this->buckles->pluck('id')->values(),
            ),
            'size_ids' => $this->when(
                $isAdmin && $this->relationLoaded('sizes'),
                fn () => $this->sizes->pluck('id')->values(),
            ),
            'collection' => $this->whenLoaded('collection', fn () => [
                'id' => $this->collection?->id,
                'name' => $this->collection?->name,
                'slug' => $this->collection?->slug,
            ]),
            'models' => $this->when(
                $request->route()?->parameter('slug') !== null,
                fn () => [
                    'body' => AssetUrl::publicUrl($this->body_model_path),
                    'sole' => AssetUrl::publicUrl($this->sole_model_path),
                    'logo' => AssetUrl::publicUrl($this->logo_model_path),
                    'inner' => AssetUrl::publicUrl($this->inner_model_path),
                    'default_buckle' => AssetUrl::publicUrl($this->default_buckle_model_path),
                ]
            ),
            'supported_types' => $this->supported_types ?? ['backless', 'covered'],
            'materials' => MaterialResource::collection($this->whenLoaded('materials')),
            'colors' => ColorResource::collection($this->whenLoaded('colors')),
            'buckles' => BuckleResource::collection($this->whenLoaded('buckles')),
            'sizes' => SizeResource::collection($this->whenLoaded('sizes')),
            'sole_colors' => $this->when(
                $request->route()?->parameter('slug') !== null,
                fn () => SoleColorResource::collection(
                    SoleColor::query()
                        ->where('is_active', true)
                        ->orderBy('sort_order')
                        ->get()
                )
            ),
        ];
    }
}
