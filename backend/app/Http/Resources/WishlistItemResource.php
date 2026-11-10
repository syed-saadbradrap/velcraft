<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\WishlistItem */
class WishlistItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'shoe_id' => $this->shoe_id,
            'customization' => $this->customization,
            'shoe' => $this->whenLoaded('shoe', fn () => new ShoeResource($this->shoe)),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
