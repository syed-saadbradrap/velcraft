<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CollectionResource;
use App\Models\Collection;
use App\Support\ApiResponse;
use App\Support\AssetUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCollectionController extends Controller
{
    public function index(): JsonResponse
    {
        $collections = Collection::query()
            ->withCount(['shoes' => fn ($query) => $query->where('is_active', true)])
            ->orderBy('sort_order')
            ->get();

        return ApiResponse::success(CollectionResource::collection($collections));
    }

    public function update(Request $request, Collection $collection): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image_path' => ['nullable', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $collection->update($validated);
        $collection->loadCount(['shoes' => fn ($query) => $query->where('is_active', true)]);

        return ApiResponse::success([
            'id' => $collection->id,
            'name' => $collection->name,
            'slug' => $collection->slug,
            'description' => $collection->description,
            'image_path' => $collection->image_path,
            'image_url' => AssetUrl::publicUrl($collection->image_path),
            'is_active' => $collection->is_active,
            'sort_order' => $collection->sort_order,
            'shoes_count' => $collection->shoes_count,
        ], 'Collection updated.');
    }
}
