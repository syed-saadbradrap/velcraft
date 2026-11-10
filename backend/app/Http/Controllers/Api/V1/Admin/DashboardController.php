<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Shoe;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $totalRevenue = (float) Order::query()
            ->where('payment_status', PaymentStatus::Paid)
            ->sum('total');

        $monthRevenue = (float) Order::query()
            ->where('payment_status', PaymentStatus::Paid)
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('total');

        return ApiResponse::success([
            'orders' => [
                'total' => Order::query()->count(),
                'pending' => Order::query()->where('status', OrderStatus::Pending)->count(),
                'processing' => Order::query()->where('status', OrderStatus::Processing)->count(),
                'shipped' => Order::query()->where('status', OrderStatus::Shipped)->count(),
                'delivered' => Order::query()->where('status', OrderStatus::Delivered)->count(),
            ],
            'customers' => User::query()->where('role', UserRole::Customer)->count(),
            'shoes' => Shoe::query()->count(),
            'active_shoes' => Shoe::query()->where('is_active', true)->count(),
            'coupons' => [
                'total' => Coupon::query()->count(),
                'active' => Coupon::query()->where('is_active', true)->count(),
            ],
            'contact_messages' => [
                'total' => ContactMessage::query()->count(),
                'new' => ContactMessage::query()->where('status', 'new')->count(),
            ],
            'revenue' => [
                'total' => round($totalRevenue, 2),
                'month' => round($monthRevenue, 2),
            ],
            'recent_orders' => Order::query()
                ->with('user')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (Order $order) => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->user?->name ?? $order->guest_email ?? 'Guest',
                    'total' => (float) $order->total,
                    'status' => $order->status->value,
                    'payment_status' => $order->payment_status->value,
                    'created_at' => $order->created_at?->toIso8601String(),
                ]),
            'recent_messages' => ContactMessage::query()
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (ContactMessage $message) => [
                    'id' => $message->id,
                    'name' => $message->name,
                    'email' => $message->email,
                    'subject' => $message->subject,
                    'status' => $message->status,
                    'created_at' => $message->created_at?->toIso8601String(),
                ]),
        ]);
    }
}
