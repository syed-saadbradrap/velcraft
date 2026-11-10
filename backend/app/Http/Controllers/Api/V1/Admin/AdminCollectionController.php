<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CollectionResource;
use App\Models\Collection;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

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
}
