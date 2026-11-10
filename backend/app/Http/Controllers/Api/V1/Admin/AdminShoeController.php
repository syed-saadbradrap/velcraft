<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShoeResource;
use App\Models\Shoe;
use App\Support\AdminPagination;
use App\Support\ApiResponse;
use App\Support\StoragePath;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminShoeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $shoes = Shoe::query()
            ->with(['collection', 'materials', 'colors', 'buckles', 'sizes'])
            ->when($request->query('collection_id'), fn ($query, $collectionId) => $query->where('collection_id', $collectionId))
            ->when($request->query('search'), function ($query, $search): void {
                $escaped = addcslashes((string) $search, '%_\\');
                $query->where(function ($inner) use ($escaped): void {
                    $inner->where('name', 'like', "%{$escaped}%")
                        ->orWhere('slug', 'like', "%{$escaped}%");
                });
            })
            ->orderBy('sort_order')
            ->paginate((int) $request->query('per_page', 20));

        return ApiResponse::success(
            AdminPagination::resourcePayload($shoes, ShoeResource::class, $request),
        );
    }

    public function show(Shoe $shoe): JsonResponse
    {
        return ApiResponse::success(
            new ShoeResource($shoe->load(['collection', 'materials', 'colors', 'buckles', 'sizes'])),
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateShoe($request);
        $relations = $this->extractRelations($validated);
        $validated['slug'] = $this->resolveSlug($validated['slug'] ?? null, $validated['name']);

        $shoe = Shoe::query()->create($validated);
        $this->applyRelations($shoe, $relations);

        return ApiResponse::success(
            new ShoeResource($shoe->load(['collection', 'materials', 'colors', 'buckles', 'sizes'])),
            'Shoe created.',
            201,
        );
    }

    public function update(Request $request, Shoe $shoe): JsonResponse
    {
        $validated = $this->validateShoe($request, partial: true);
        $relations = $this->extractRelations($validated);

        if (array_key_exists('slug', $validated) || array_key_exists('name', $validated)) {
            $validated['slug'] = $this->resolveSlug(
                $validated['slug'] ?? $shoe->slug,
                $validated['name'] ?? $shoe->name,
                $shoe->id,
            );
        }

        $shoe->update($validated);
        $this->applyRelations($shoe, $relations);

        return ApiResponse::success(
            new ShoeResource($shoe->fresh(['collection', 'materials', 'colors', 'buckles', 'sizes'])),
            'Shoe updated.',
        );
    }

    public function destroy(Shoe $shoe): JsonResponse
    {
        $shoe->materials()->detach();
        $shoe->colors()->detach();
        $shoe->buckles()->detach();
        $shoe->sizes()->detach();
        $shoe->delete();

        return ApiResponse::success(null, 'Shoe deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateShoe(Request $request, bool $partial = false): array
    {
        return $request->validate([
            'collection_id' => [$partial ? 'sometimes' : 'nullable', 'integer', 'exists:collections,id'],
            'name' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'base_price' => [$partial ? 'sometimes' : 'required', 'numeric', 'min:0'],
            'thumbnail_path' => ['nullable', 'string', 'max:255', StoragePath::IMAGE],
            'body_model_path' => [$partial ? 'sometimes' : 'required', 'string', 'max:255', StoragePath::MODEL],
            'sole_model_path' => [$partial ? 'sometimes' : 'required', 'string', 'max:255', StoragePath::MODEL],
            'logo_model_path' => ['nullable', 'string', 'max:255', StoragePath::MODEL],
            'inner_model_path' => ['nullable', 'string', 'max:255', StoragePath::MODEL],
            'default_buckle_model_path' => ['nullable', 'string', 'max:255', StoragePath::MODEL],
            'supported_types' => ['nullable', 'array'],
            'supported_types.*' => ['string', 'max:50'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'material_ids' => ['nullable', 'array'],
            'material_ids.*' => ['integer', 'exists:materials,id'],
            'color_ids' => ['nullable', 'array'],
            'color_ids.*' => ['integer', 'exists:colors,id'],
            'buckle_ids' => ['nullable', 'array'],
            'buckle_ids.*' => ['integer', 'exists:buckles,id'],
            'size_ids' => ['nullable', 'array'],
            'size_ids.*' => ['integer', 'exists:sizes,id'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, array<int>|null>
     */
    private function extractRelations(array &$validated): array
    {
        $relations = [
            'material_ids' => $validated['material_ids'] ?? null,
            'color_ids' => $validated['color_ids'] ?? null,
            'buckle_ids' => $validated['buckle_ids'] ?? null,
            'size_ids' => $validated['size_ids'] ?? null,
        ];

        unset($validated['material_ids'], $validated['color_ids'], $validated['buckle_ids'], $validated['size_ids']);

        return $relations;
    }

    /**
     * @param  array<string, array<int>|null>  $relations
     */
    private function applyRelations(Shoe $shoe, array $relations): void
    {
        if ($relations['material_ids'] !== null) {
            $shoe->materials()->sync($relations['material_ids']);
        }

        if ($relations['color_ids'] !== null) {
            $shoe->colors()->sync($relations['color_ids']);
        }

        if ($relations['buckle_ids'] !== null) {
            $shoe->buckles()->sync($relations['buckle_ids']);
        }

        if ($relations['size_ids'] !== null) {
            $shoe->sizes()->sync($relations['size_ids']);
        }
    }

    private function resolveSlug(?string $slug, string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($slug ?: $name);
        $candidate = $baseSlug;
        $counter = 1;

        while (
            Shoe::query()
                ->when($ignoreId !== null, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->where('slug', $candidate)
                ->exists()
        ) {
            $candidate = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $candidate;
    }
}
