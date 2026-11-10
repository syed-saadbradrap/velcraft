<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\CartItem */
class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'shoe_id' => $this->shoe_id,
            'quantity' => $this->quantity,
            'customization' => $this->customization,
            'unit_price' => (float) $this->unit_price,
            'line_total' => $this->lineTotal(),
            'shoe' => $this->whenLoaded('shoe', fn () => new ShoeResource($this->shoe)),
        ];
    }
}
