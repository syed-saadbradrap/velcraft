<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\CouponType;
use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Support\AdminPagination;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminCouponController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $coupons = Coupon::query()
            ->when($request->query('search'), fn ($query, $search) => $query->where('code', 'like', "%{$search}%"))
            ->latest()
            ->paginate((int) $request->query('per_page', 20));

        return ApiResponse::success(
            AdminPagination::payload($coupons, fn (Coupon $coupon) => $this->transformCoupon($coupon)),
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateCoupon($request);
        $validated['code'] = strtoupper($validated['code']);

        $coupon = Coupon::query()->create($validated);

        return ApiResponse::success($this->transformCoupon($coupon), 'Coupon created.', 201);
    }

    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $validated = $this->validateCoupon($request, partial: true);

        if (isset($validated['code'])) {
            $validated['code'] = strtoupper($validated['code']);
        }

        $coupon->update($validated);

        return ApiResponse::success($this->transformCoupon($coupon->fresh()), 'Coupon updated.');
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();

        return ApiResponse::success(null, 'Coupon deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateCoupon(Request $request, bool $partial = false): array
    {
        return $request->validate([
            'code' => [$partial ? 'sometimes' : 'required', 'string', 'max:50'],
            'type' => [$partial ? 'sometimes' : 'required', Rule::enum(CouponType::class)],
            'value' => [$partial ? 'sometimes' : 'required', 'numeric', 'min:0'],
            'min_order_amount' => ['sometimes', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
            'expires_at' => ['nullable', 'date'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function transformCoupon(Coupon $coupon): array
    {
        return [
            'id' => $coupon->id,
            'code' => $coupon->code,
            'type' => $coupon->type->value,
            'value' => (float) $coupon->value,
            'min_order_amount' => (float) $coupon->min_order_amount,
            'max_uses' => $coupon->max_uses,
            'used_count' => $coupon->used_count,
            'is_active' => $coupon->is_active,
            'expires_at' => $coupon->expires_at?->toIso8601String(),
            'created_at' => $coupon->created_at?->toIso8601String(),
        ];
    }
}
