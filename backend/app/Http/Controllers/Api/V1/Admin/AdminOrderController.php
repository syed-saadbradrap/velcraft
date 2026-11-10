<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Support\AdminPagination;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->with(['user', 'items', 'coupon'])
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->query('search'), fn ($query, $search) => $query->where(function ($inner) use ($search): void {
                $inner->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($userQuery) => $userQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));
            }))
            ->latest()
            ->paginate((int) $request->query('per_page', 20));

        return ApiResponse::success(
            AdminPagination::resourcePayload($orders, OrderResource::class, $request),
        );
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['user', 'items.shoe', 'coupon']);

        return ApiResponse::success(new OrderResource($order));
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(OrderStatus::class)],
        ]);

        $order->update([
            'status' => OrderStatus::from($validated['status']),
        ]);

        return ApiResponse::success(
            new OrderResource($order->fresh(['user', 'items.shoe', 'coupon'])),
            'Order status updated.',
        );
    }
}
