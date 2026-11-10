<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\SiteSetting;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = SiteSetting::query()
            ->whereIn('key', ['contact', 'brand'])
            ->get()
            ->keyBy('key');

        return ApiResponse::success([
            'brand' => $settings->get('brand')?->value ?? [
                'name' => config('app.name', 'Custom Shoes'),
            ],
            'contact' => $settings->get('contact')?->value ?? [
                'title' => 'Get in Touch',
                'description' => 'Reach out through your preferred method, and we\'ll respond as quickly as possible.',
                'email' => 'support@velcraftpk.com',
                'phone' => '+92 300 0000000',
                'hours' => 'Monday - Saturday, 12:00 PM - 10:00 PM (PKT)',
                'address' => 'Dolmen Center, Tariq Road, Karachi, Pakistan',
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('Validation failed.', 422, $validator->errors());
        }

        ContactMessage::query()->create([
            ...$validator->validated(),
            'status' => 'new',
        ]);

        return ApiResponse::success(null, 'Message received. Our concierge team will respond shortly.', 201);
    }
}
