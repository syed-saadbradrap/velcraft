<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Admin\Concerns\ManagesSimpleContent;
use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use App\Support\AssetUrl;
use Illuminate\Database\Eloquent\Model;

class AdminHeroSlideController extends Controller
{
    use ManagesSimpleContent;

    protected function contentModel(): string
    {
        return HeroSlide::class;
    }

    protected function contentRules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return [
            'title' => [$req, 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image_path' => ['nullable', 'string', 'max:500'],
            'cta_label' => ['nullable', 'string', 'max:120'],
            'cta_url' => ['nullable', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    protected function transformContent(Model $item): array
    {
        /** @var HeroSlide $item */
        return [
            'id' => $item->id,
            'title' => $item->title,
            'subtitle' => $item->subtitle,
            'description' => $item->description,
            'image_path' => $item->image_path,
            'image_url' => AssetUrl::publicUrl($item->image_path),
            'cta_label' => $item->cta_label,
            'cta_url' => $item->cta_url,
            'is_active' => $item->is_active,
            'sort_order' => $item->sort_order,
        ];
    }
}
