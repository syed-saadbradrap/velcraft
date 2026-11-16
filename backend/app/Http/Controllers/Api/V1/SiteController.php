<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Support\ApiResponse;
use App\Support\AssetUrl;
use Illuminate\Http\JsonResponse;

class SiteController extends Controller
{
    public function show(): JsonResponse
    {
        $keys = [
            'brand',
            'contact',
            'navigation',
            'footer',
            'header',
            'commerce',
            'payments',
            'newsletter',
            'customize_page',
        ];

        $settings = SiteSetting::query()
            ->whereIn('key', $keys)
            ->get()
            ->keyBy('key');

        $brand = $settings->get('brand')?->value ?? [];
        if (! empty($brand['logo_path'])) {
            $brand['logo_url'] = AssetUrl::publicUrl($brand['logo_path']);
        }

        return ApiResponse::success([
            'brand' => $brand ?: [
                'name' => 'Velcraft',
                'tagline' => 'Bespoke luxury footwear',
                'description' => 'Design footwear that\'s made to match your style.',
            ],
            'contact' => $settings->get('contact')?->value ?? [],
            'navigation' => $settings->get('navigation')?->value ?? [],
            'footer' => $settings->get('footer')?->value ?? [],
            'header' => $settings->get('header')?->value ?? [],
            'commerce' => $settings->get('commerce')?->value ?? [],
            'payments' => $settings->get('payments')?->value ?? [],
            'newsletter' => $settings->get('newsletter')?->value ?? [],
            'customize_page' => $settings->get('customize_page')?->value ?? [],
        ]);
    }
}
