<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Admin\Concerns\ManagesSimpleContent;
use App\Http\Controllers\Controller;
use App\Models\WhyChooseItem;
use Illuminate\Database\Eloquent\Model;

class AdminWhyChooseItemController extends Controller
{
    use ManagesSimpleContent;

    protected function contentModel(): string
    {
        return WhyChooseItem::class;
    }

    protected function contentRules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return [
            'title' => [$req, 'string', 'max:255'],
            'description' => [$req, 'string'],
            'icon' => ['nullable', 'string', 'max:80'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    protected function transformContent(Model $item): array
    {
        /** @var WhyChooseItem $item */
        return [
            'id' => $item->id,
            'title' => $item->title,
            'description' => $item->description,
            'icon' => $item->icon,
            'is_active' => $item->is_active,
            'sort_order' => $item->sort_order,
        ];
    }
}
