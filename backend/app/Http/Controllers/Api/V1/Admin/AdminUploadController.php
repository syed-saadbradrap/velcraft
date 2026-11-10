<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use App\Support\AssetUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminUploadController extends Controller
{
    public function storeImage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:8192'],
        ]);

        $file = $validated['image'];
        $extension = strtolower($file->getClientOriginalExtension() ?: 'png');
        $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $filename = $filename !== '' ? "{$filename}-" . Str::random(8) . ".{$extension}" : Str::random(16) . ".{$extension}";

        $storedPath = $file->storeAs('images/shoes/uploads', $filename, 'public');

        return ApiResponse::success([
            'path' => $storedPath,
            'url' => AssetUrl::publicUrl($storedPath),
        ], 'Image uploaded.', 201);
    }
}
