<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PageSection;
use App\Support\ApiResponse;
use App\Support\AssetUrl;
use Illuminate\Http\JsonResponse;

class PageController extends Controller
{
    public function show(string $pageKey): JsonResponse
    {
        $sections = PageSection::query()
            ->where('page_key', $pageKey)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->mapWithKeys(fn (PageSection $section) => [
                $section->section_key => [
                    'eyebrow' => $section->eyebrow,
                    'title' => $section->title,
                    'description' => $section->description,
                    'body_json' => $section->body_json,
                    'image_url' => AssetUrl::publicUrl($section->image_path),
                    'cta_label' => $section->cta_label,
                    'cta_url' => $section->cta_url,
                ],
            ]);

        return ApiResponse::success([
            'page_key' => $pageKey,
            'sections' => $sections,
        ]);
    }
}
