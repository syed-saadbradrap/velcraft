<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminPagination
{
    /**
     * @param  callable(mixed): mixed  $transform
     * @return array{items: array<int, mixed>, pagination: array<string, int>}
     */
    public static function payload(LengthAwarePaginator $paginator, callable $transform): array
    {
        return [
            'items' => collect($paginator->items())->map($transform)->values()->all(),
            'pagination' => self::meta($paginator),
        ];
    }

    /**
     * @param  class-string<JsonResource>  $resourceClass
     * @return array{items: array<int, mixed>, pagination: array<string, int>}
     */
    public static function resourcePayload(
        LengthAwarePaginator $paginator,
        string $resourceClass,
        Request $request,
    ): array {
        $payload = $resourceClass::collection($paginator->items())->toArray($request);
        $items = array_is_list($payload) ? $payload : ($payload['data'] ?? []);

        return [
            'items' => array_values($items),
            'pagination' => self::meta($paginator),
        ];
    }

    /**
     * @return array<string, int>
     */
    private static function meta(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];
    }
}
