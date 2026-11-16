<?php

namespace App\Http\Controllers\Api\V1\Admin\Concerns;

use App\Support\ApiResponse;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

trait ManagesSimpleContent
{
    abstract protected function contentModel(): string;

    /**
     * @return array<string, mixed>
     */
    abstract protected function contentRules(bool $partial = false): array;

    /**
     * @return array<string, mixed>
     */
    abstract protected function transformContent(Model $item): array;

    public function index(): JsonResponse
    {
        $items = $this->contentModel()::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (Model $item) => $this->transformContent($item));

        return ApiResponse::success($items);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->contentRules());
        $item = $this->contentModel()::query()->create($validated);

        return ApiResponse::success($this->transformContent($item), 'Created.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $item = $this->contentModel()::query()->findOrFail($id);
        $validated = $request->validate($this->contentRules(partial: true));
        $item->update($validated);

        return ApiResponse::success($this->transformContent($item->fresh()), 'Updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        $this->contentModel()::query()->findOrFail($id)->delete();

        return ApiResponse::success(null, 'Deleted.');
    }
}
