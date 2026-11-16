<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Admin\Concerns\ManagesSimpleContent;
use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use App\Support\AssetUrl;
use Illuminate\Database\Eloquent\Model;

class AdminTestimonialController extends Controller
{
    use ManagesSimpleContent;

    protected function contentModel(): string
    {
        return Testimonial::class;
    }

    protected function contentRules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return [
            'customer_name' => [$req, 'string', 'max:255'],
            'customer_title' => ['nullable', 'string', 'max:255'],
            'content' => [$req, 'string'],
            'rating' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'avatar_path' => ['nullable', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    protected function transformContent(Model $item): array
    {
        /** @var Testimonial $item */
        return [
            'id' => $item->id,
            'customer_name' => $item->customer_name,
            'customer_title' => $item->customer_title,
            'content' => $item->content,
            'rating' => $item->rating,
            'avatar_path' => $item->avatar_path,
            'avatar_url' => AssetUrl::publicUrl($item->avatar_path),
            'is_active' => $item->is_active,
            'sort_order' => $item->sort_order,
        ];
    }
}
