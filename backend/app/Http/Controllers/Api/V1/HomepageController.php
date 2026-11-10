<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CollectionResource;
use App\Http\Resources\ShoeResource;
use App\Models\Collection;
use App\Models\HeroSlide;
use App\Models\ProcessStep;
use App\Models\Shoe;
use App\Models\SiteSetting;
use App\Models\Testimonial;
use App\Models\WhyChooseItem;
use App\Support\ApiResponse;
use App\Support\AssetUrl;
use Illuminate\Http\JsonResponse;

class HomepageController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = SiteSetting::query()
            ->whereIn('key', ['brand', 'newsletter'])
            ->get()
            ->keyBy('key');

        return ApiResponse::success([
            'brand' => $settings->get('brand')?->value ?? [
                'name' => config('app.name', 'Custom Shoes'),
                'tagline' => 'Crafted for those who walk their own path.',
            ],
            'hero' => HeroSlide::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->map(fn (HeroSlide $slide) => [
                    'title' => $slide->title,
                    'subtitle' => $slide->subtitle,
                    'description' => $slide->description,
                    'image_url' => AssetUrl::publicUrl($slide->image_path),
                    'cta_label' => $slide->cta_label,
                    'cta_url' => $slide->cta_url,
                ]),
            'featured_shoes' => ShoeResource::collection(
                Shoe::query()
                    ->with('collection')
                    ->where('is_active', true)
                    ->where('is_featured', true)
                    ->orderBy('sort_order')
                    ->limit(6)
                    ->get()
            ),
            'process_steps' => ProcessStep::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->map(fn (ProcessStep $step) => [
                    'title' => $step->title,
                    'description' => $step->description,
                    'icon' => $step->icon,
                ]),
            'why_choose_us' => WhyChooseItem::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->map(fn (WhyChooseItem $item) => [
                    'title' => $item->title,
                    'description' => $item->description,
                    'icon' => $item->icon,
                ]),
            'testimonials' => Testimonial::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->map(fn (Testimonial $testimonial) => [
                    'customer_name' => $testimonial->customer_name,
                    'customer_title' => $testimonial->customer_title,
                    'content' => $testimonial->content,
                    'rating' => $testimonial->rating,
                    'avatar_url' => AssetUrl::publicUrl($testimonial->avatar_path),
                ]),
            'newsletter' => $settings->get('newsletter')?->value ?? [
                'title' => 'Join the Atelier List',
                'description' => 'Receive early access to new collections and bespoke customization drops.',
            ],
        ]);
    }
}
