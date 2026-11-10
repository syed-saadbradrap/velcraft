<?php

namespace App\Http\Resources;

use App\Support\AssetUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Buckle */
class BuckleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'model_url' => AssetUrl::publicUrl($this->model_path),
            'thumbnail_url' => AssetUrl::publicUrl($this->thumbnail_path),
            'price_modifier' => (float) $this->price_modifier,
        ];
    }
}
