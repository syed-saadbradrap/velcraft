<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSiteSettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = SiteSetting::query()
            ->orderBy('key')
            ->get()
            ->mapWithKeys(fn (SiteSetting $setting) => [$setting->key => $setting->value ?? []]);

        return ApiResponse::success($settings);
    }

    public function show(string $key): JsonResponse
    {
        $setting = SiteSetting::query()->where('key', $key)->first();

        return ApiResponse::success([
            'key' => $key,
            'value' => $setting?->value ?? [],
        ]);
    }

    public function update(Request $request, string $key): JsonResponse
    {
        $validated = $request->validate([
            'value' => ['required', 'array'],
        ]);

        $setting = SiteSetting::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $validated['value']],
        );

        return ApiResponse::success([
            'key' => $setting->key,
            'value' => $setting->value ?? [],
        ], 'Setting updated.');
    }

    public function updateMany(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => ['required', 'array'],
        ]);

        foreach ($validated['settings'] as $key => $value) {
            if (! is_string($key) || ! is_array($value)) {
                continue;
            }

            SiteSetting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value],
            );
        }

        return $this->index();
    }
}
