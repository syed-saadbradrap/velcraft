<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShippingAddressResource;
use App\Models\ShippingAddress;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ShippingAddressController extends Controller
{
    public function index(): JsonResponse
    {
        $addresses = $this->authenticatedUser()
            ->shippingAddresses()
            ->orderByDesc('is_default')
            ->latest()
            ->get();

        return ApiResponse::success(ShippingAddressResource::collection($addresses));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateAddress($request);

        $user = $this->authenticatedUser();
        $address = DB::transaction(function () use ($user, $validated): ShippingAddress {
            if ($validated['is_default'] ?? false) {
                $user->shippingAddresses()->update(['is_default' => false]);
            }

            return $user->shippingAddresses()->create($validated);
        });

        return ApiResponse::success(new ShippingAddressResource($address), 'Shipping address created.', 201);
    }

    public function update(Request $request, ShippingAddress $shippingAddress): JsonResponse
    {
        $this->authorizeAddress($shippingAddress);
        $validated = $this->validateAddress($request, partial: true);

        DB::transaction(function () use ($shippingAddress, $validated): void {
            if ($validated['is_default'] ?? false) {
                $shippingAddress->user->shippingAddresses()->update(['is_default' => false]);
            }

            $shippingAddress->update($validated);
        });

        return ApiResponse::success(new ShippingAddressResource($shippingAddress->fresh()), 'Shipping address updated.');
    }

    public function destroy(ShippingAddress $shippingAddress): JsonResponse
    {
        $this->authorizeAddress($shippingAddress);
        $shippingAddress->delete();

        return ApiResponse::success(null, 'Shipping address deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateAddress(Request $request, bool $partial = false): array
    {
        $rules = [
            'full_name' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address_line_1' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'max:255'],
            'postal_code' => [$partial ? 'sometimes' : 'required', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'size:2'],
            'is_default' => ['sometimes', 'boolean'],
        ];

        $validated = $request->validate($rules);

        if (isset($validated['country'])) {
            $validated['country'] = strtoupper($validated['country']);
        } else {
            $validated['country'] = strtoupper(config('commerce.default_country', 'PK'));
        }

        return $validated;
    }

    private function authenticatedUser(): User
    {
        /** @var User $user */
        $user = Auth::guard('api')->user();

        return $user;
    }

    private function authorizeAddress(ShippingAddress $shippingAddress): void
    {
        if ($shippingAddress->user_id !== $this->authenticatedUser()->id) {
            throw ValidationException::withMessages([
                'shipping_address' => ['This shipping address does not belong to your account.'],
            ]);
        }
    }
}
