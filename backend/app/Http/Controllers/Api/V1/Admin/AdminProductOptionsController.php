<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BuckleResource;
use App\Http\Resources\ColorResource;
use App\Http\Resources\MaterialResource;
use App\Http\Resources\SizeResource;
use App\Models\Buckle;
use App\Models\Color;
use App\Models\Material;
use App\Models\Size;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminProductOptionsController extends Controller
{
    public function index(): JsonResponse
    {
        return ApiResponse::success($this->optionPayload());
    }

    public function storeMaterial(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:materials,slug'],
            'texture_path' => ['nullable', 'string', 'max:255'],
            'price_modifier' => ['nullable', 'numeric', 'min:0'],
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['name']);
        $baseSlug = $slug;
        $counter = 1;

        while (Material::query()->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        $material = Material::query()->create([
            'name' => $validated['name'],
            'slug' => $slug,
            'texture_path' => $validated['texture_path'] ?? 'textures/synthetic-leather.jpg',
            'price_modifier' => $validated['price_modifier'] ?? 0,
            'is_active' => true,
            'sort_order' => (int) Material::query()->max('sort_order') + 1,
        ]);

        return ApiResponse::success(new MaterialResource($material), 'Material created.', 201);
    }

    public function destroyMaterial(Material $material): JsonResponse
    {
        $material->delete();

        return ApiResponse::success(null, 'Material deleted.');
    }

    public function storeColor(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'hex_code' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $color = Color::query()->create([
            'name' => $validated['name'],
            'hex_code' => strtoupper($validated['hex_code']),
            'is_active' => true,
            'sort_order' => (int) Color::query()->max('sort_order') + 1,
        ]);

        return ApiResponse::success(new ColorResource($color), 'Color created.', 201);
    }

    public function destroyColor(Color $color): JsonResponse
    {
        $color->delete();

        return ApiResponse::success(null, 'Color deleted.');
    }

    public function storeSize(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'gender' => ['required', Rule::in(['men', 'women'])],
            'value' => ['required', 'integer', 'min:30', 'max:50'],
            'label' => ['nullable', 'string', 'max:20'],
        ]);

        $size = Size::query()->updateOrCreate(
            [
                'gender' => $validated['gender'],
                'value' => $validated['value'],
            ],
            [
                'label' => $validated['label'] ?? (string) $validated['value'],
                'is_active' => true,
                'sort_order' => (int) Size::query()->max('sort_order') + 1,
            ],
        );

        return ApiResponse::success(new SizeResource($size), 'Size saved.', 201);
    }

    public function destroySize(Size $size): JsonResponse
    {
        $size->delete();

        return ApiResponse::success(null, 'Size deleted.');
    }

    public function storeBuckle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:buckles,slug'],
            'model_path' => ['nullable', 'string', 'max:255'],
            'price_modifier' => ['nullable', 'numeric', 'min:0'],
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['name']);
        $baseSlug = $slug;
        $counter = 1;

        while (Buckle::query()->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        $buckle = Buckle::query()->create([
            'name' => $validated['name'],
            'slug' => $slug,
            'model_path' => $validated['model_path'] ?? 'models/buckles/classic-oval.glb',
            'price_modifier' => $validated['price_modifier'] ?? 0,
            'is_active' => true,
            'sort_order' => (int) Buckle::query()->max('sort_order') + 1,
        ]);

        return ApiResponse::success(new BuckleResource($buckle), 'Buckle created.', 201);
    }

    public function destroyBuckle(Buckle $buckle): JsonResponse
    {
        $buckle->delete();

        return ApiResponse::success(null, 'Buckle deleted.');
    }

    private function optionPayload(): array
    {
        return [
            'materials' => MaterialResource::collection(
                Material::query()->orderBy('name')->get(),
            ),
            'colors' => ColorResource::collection(
                Color::query()->orderBy('sort_order')->orderBy('name')->get(),
            ),
            'buckles' => BuckleResource::collection(
                Buckle::query()->orderBy('name')->get(),
            ),
            'sizes' => SizeResource::collection(
                Size::query()->orderBy('gender')->orderBy('value')->get(),
            ),
        ];
    }
}
