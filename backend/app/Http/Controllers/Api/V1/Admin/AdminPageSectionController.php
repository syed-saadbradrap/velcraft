<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageSection;
use App\Support\ApiResponse;
use App\Support\AssetUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPageSectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sections = PageSection::query()
            ->when($request->query('page_key'), fn ($query, $pageKey) => $query->where('page_key', $pageKey))
            ->orderBy('page_key')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (PageSection $section) => $this->transform($section));

        return ApiResponse::success($sections);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateSection($request);
        $section = PageSection::query()->create($validated);

        return ApiResponse::success($this->transform($section), 'Section created.', 201);
    }

    public function update(Request $request, PageSection $pageSection): JsonResponse
    {
        $validated = $this->validateSection($request, partial: true);
        $pageSection->update($validated);

        return ApiResponse::success($this->transform($pageSection->fresh()), 'Section updated.');
    }

    public function destroy(PageSection $pageSection): JsonResponse
    {
        $pageSection->delete();

        return ApiResponse::success(null, 'Section deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateSection(Request $request, bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'page_key' => [$req, 'string', 'max:80'],
            'section_key' => [$req, 'string', 'max:80'],
            'eyebrow' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'body_json' => ['nullable', 'array'],
            'image_path' => ['nullable', 'string', 'max:500'],
            'cta_label' => ['nullable', 'string', 'max:120'],
            'cta_url' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function transform(PageSection $section): array
    {
        return [
            'id' => $section->id,
            'page_key' => $section->page_key,
            'section_key' => $section->section_key,
            'eyebrow' => $section->eyebrow,
            'title' => $section->title,
            'description' => $section->description,
            'body_json' => $section->body_json,
            'image_path' => $section->image_path,
            'image_url' => AssetUrl::publicUrl($section->image_path),
            'cta_label' => $section->cta_label,
            'cta_url' => $section->cta_url,
            'sort_order' => $section->sort_order,
            'is_active' => $section->is_active,
        ];
    }
}
