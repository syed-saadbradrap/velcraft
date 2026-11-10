<?php

namespace App\Http\Resources;

use App\Support\AssetUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Collection */
class CollectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'image_url' => AssetUrl::publicUrl($this->image_path),
            'shoes_count' => $this->whenCounted('shoes'),
            'shoes' => ShoeResource::collection($this->whenLoaded('shoes')),
        ];
    }
}
