<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\User;
use App\Support\AdminPagination;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $customers = User::query()
            ->where('role', UserRole::Customer)
            ->withCount('orders')
            ->when($request->query('search'), fn ($query, $search) => $query->where(function ($inner) use ($search): void {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->latest()
            ->paginate((int) $request->query('per_page', 20));

        return ApiResponse::success(
            AdminPagination::payload($customers, fn (User $customer) => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'orders_count' => $customer->orders_count,
                'created_at' => $customer->created_at?->toIso8601String(),
            ]),
        );
    }

    public function show(User $user): JsonResponse
    {
        if ($user->role !== UserRole::Customer) {
            return ApiResponse::error('Customer not found.', 404);
        }

        $user->loadCount('orders');
        $recentOrders = $user->orders()
            ->with(['items', 'coupon'])
            ->latest()
            ->limit(10)
            ->get();

        return ApiResponse::success([
            'customer' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'orders_count' => $user->orders_count,
                'created_at' => $user->created_at?->toIso8601String(),
            ],
            'recent_orders' => OrderResource::collection($recentOrders),
        ]);
    }
}
