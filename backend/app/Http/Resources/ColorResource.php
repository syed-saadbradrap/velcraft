<?php

namespace App\Http\Resources;

use App\Support\AssetUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Color */
class ColorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'hex_code' => $this->hex_code,
            'swatch_path' => $this->swatch_path,
            'swatch_url' => AssetUrl::publicUrl($this->swatch_path),
        ];
    }
}
