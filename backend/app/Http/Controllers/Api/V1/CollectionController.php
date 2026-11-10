<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CollectionResource;
use App\Models\Collection;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class CollectionController extends Controller
{
    public function index(): JsonResponse
    {
        $collections = Collection::query()
            ->withCount(['shoes' => fn ($query) => $query->where('is_active', true)])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return ApiResponse::success(CollectionResource::collection($collections));
    }

    public function show(string $slug): JsonResponse
    {
        $collection = Collection::query()
            ->with(['shoes' => fn ($query) => $query->where('is_active', true)->orderBy('sort_order')])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return ApiResponse::success(new CollectionResource($collection));
    }
}
