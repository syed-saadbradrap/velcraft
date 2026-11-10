<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\WishlistItemResource;
use App\Models\Shoe;
use App\Models\User;
use App\Models\WishlistItem;
use App\Services\CartService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class WishlistController extends Controller
{
    public function __construct(private readonly CartService $cartService) {}

    public function index(): JsonResponse
    {
        $items = $this->authenticatedUser()
            ->wishlistItems()
            ->with('shoe.collection')
            ->latest()
            ->get();

        return ApiResponse::success(WishlistItemResource::collection($items));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shoe_id' => ['required', 'integer', 'exists:shoes,id'],
            'customization' => ['nullable', 'array'],
        ]);

        $user = $this->authenticatedUser();
        $shoe = Shoe::query()->where('is_active', true)->findOrFail($validated['shoe_id']);

        if (! empty($validated['customization'])) {
            $this->cartService->validateCustomization($shoe, $validated['customization']);
        }

        $item = WishlistItem::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'shoe_id' => $shoe->id,
            ],
            [
                'customization' => $validated['customization'] ?? null,
            ],
        )->load('shoe.collection');

        return ApiResponse::success(new WishlistItemResource($item), 'Item saved to wishlist.', 201);
    }

    public function destroy(WishlistItem $wishlistItem): JsonResponse
    {
        if ($wishlistItem->user_id !== $this->authenticatedUser()->id) {
            throw ValidationException::withMessages([
                'wishlist_item' => ['This wishlist item does not belong to your account.'],
            ]);
        }

        $wishlistItem->delete();

        return ApiResponse::success(null, 'Item removed from wishlist.');
    }

    private function authenticatedUser(): User
    {
        /** @var User $user */
        $user = Auth::guard('api')->user();

        return $user;
    }
}
