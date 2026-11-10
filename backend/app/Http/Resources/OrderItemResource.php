<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\OrderItem */
class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'shoe_id' => $this->shoe_id,
            'shoe_name' => $this->shoe_name,
            'quantity' => $this->quantity,
            'customization' => $this->customization,
            'unit_price' => (float) $this->unit_price,
            'total_price' => (float) $this->total_price,
            'shoe' => $this->whenLoaded('shoe', fn () => new ShoeResource($this->shoe)),
        ];
    }
}
