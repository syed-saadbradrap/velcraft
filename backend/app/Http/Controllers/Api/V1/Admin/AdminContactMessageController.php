<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Support\AdminPagination;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminContactMessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $messages = ContactMessage::query()
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->query('search'), fn ($query, $search) => $query->where(function ($inner) use ($search): void {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            }))
            ->latest()
            ->paginate((int) $request->query('per_page', 20));

        return ApiResponse::success(
            AdminPagination::payload($messages, fn (ContactMessage $message) => $message->toArray()),
        );
    }

    public function show(ContactMessage $contactMessage): JsonResponse
    {
        return ApiResponse::success($contactMessage);
    }

    public function update(Request $request, ContactMessage $contactMessage): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['new', 'read', 'replied', 'archived'])],
        ]);

        $contactMessage->update($validated);

        return ApiResponse::success($contactMessage->fresh(), 'Contact message updated.');
    }
}
