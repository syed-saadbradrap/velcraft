<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShoeResource;
use App\Models\Shoe;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShoeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $shoes = Shoe::query()
            ->with('collection')
            ->where('is_active', true)
            ->when($request->query('collection'), fn ($query, $slug) => $query->whereHas(
                'collection',
                fn ($collectionQuery) => $collectionQuery->where('slug', $slug)
            ))
            ->orderBy('sort_order')
            ->paginate((int) $request->query('per_page', 12));

        return ApiResponse::success([
            'items' => ShoeResource::collection($shoes),
            'pagination' => [
                'current_page' => $shoes->currentPage(),
                'last_page' => $shoes->lastPage(),
                'per_page' => $shoes->perPage(),
                'total' => $shoes->total(),
            ],
        ]);
    }

    public function featured(): JsonResponse
    {
        $shoes = Shoe::query()
            ->with('collection')
            ->where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('sort_order')
            ->limit(6)
            ->get();

        return ApiResponse::success(ShoeResource::collection($shoes));
    }

    public function show(string $slug): JsonResponse
    {
        $shoe = Shoe::query()
            ->with([
                'collection',
                'materials',
                'colors' => fn ($query) => $query->where('is_active', true)->orderBy('sort_order'),
                'buckles' => fn ($query) => $query->where('is_active', true)->orderBy('sort_order'),
                'sizes',
            ])
            ->where('slug', $slug)
            ->when(
                $slug !== 'ivory-gold-bit-mule',
                fn ($query) => $query->where('is_active', true),
            )
            ->firstOrFail();

        return ApiResponse::success(new ShoeResource($shoe));
    }
}
