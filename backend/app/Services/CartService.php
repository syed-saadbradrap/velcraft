<?php



namespace App\Services;



use App\Models\Buckle;

use App\Models\Cart;

use App\Models\CartItem;

use App\Models\Coupon;

use App\Models\Material;

use App\Models\Shoe;

use App\Models\User;

use Illuminate\Validation\ValidationException;



class CartService

{

    public function getOrCreateCart(User $user): Cart

    {

        return Cart::query()->firstOrCreate(['user_id' => $user->id]);

    }



    public function getOrCreateGuestCart(string $guestToken): Cart

    {

        return Cart::query()->firstOrCreate(['guest_token' => $guestToken]);

    }



    public function resolveCart(?User $user, ?string $guestToken): Cart

    {

        if ($user !== null) {

            $cart = $this->getOrCreateCart($user);



            if ($guestToken !== null && $guestToken !== '') {

                $this->mergeGuestCartIntoUser($guestToken, $cart);

            }



            return $cart->load(['items.shoe.collection']);

        }



        if ($guestToken === null || $guestToken === '') {

            throw ValidationException::withMessages([

                'guest_token' => ['Guest token is required.'],

            ]);

        }



        return $this->getOrCreateGuestCart($guestToken)->load(['items.shoe.collection']);

    }



    public function mergeGuestCartIntoUser(string $guestToken, Cart $userCart): void

    {

        $guestCart = Cart::query()->where('guest_token', $guestToken)->first();



        if ($guestCart === null || $guestCart->id === $userCart->id) {

            return;

        }



        $guestCart->loadMissing(['items.shoe']);



        foreach ($guestCart->items as $item) {

            $this->addItem(

                $userCart,

                $item->shoe,

                $item->customization ?? [],

                $item->quantity,

            );

        }



        $this->clear($guestCart);

        $guestCart->delete();

    }



    public function addItem(Cart $cart, Shoe $shoe, array $customization, int $quantity = 1): CartItem

    {

        $this->validateCustomization($shoe, $customization);



        $normalizedCustomization = $this->normalizeCustomization($customization);

        $unitPrice = $this->calculateUnitPrice($shoe, $normalizedCustomization);



        $existingItem = $cart->items()

            ->where('shoe_id', $shoe->id)

            ->get()

            ->first(fn (CartItem $item) => $item->customization === $normalizedCustomization);



        if ($existingItem !== null) {

            $existingItem->update([

                'quantity' => $existingItem->quantity + $quantity,

                'unit_price' => $unitPrice,

            ]);



            return $existingItem->fresh(['shoe.collection']);

        }



        return $cart->items()->create([

            'shoe_id' => $shoe->id,

            'quantity' => $quantity,

            'customization' => $normalizedCustomization,

            'unit_price' => $unitPrice,

        ])->load('shoe.collection');

    }



    public function updateItem(CartItem $item, int $quantity): CartItem

    {

        if ($quantity < 1) {

            throw ValidationException::withMessages([

                'quantity' => ['Quantity must be at least 1.'],

            ]);

        }



        $item->loadMissing('shoe');

        $unitPrice = $this->calculateUnitPrice($item->shoe, $item->customization ?? []);



        $item->update([

            'quantity' => $quantity,

            'unit_price' => $unitPrice,

        ]);



        return $item->fresh(['shoe.collection']);

    }



    public function removeItem(CartItem $item): void

    {

        $item->delete();

    }



    public function clear(Cart $cart): void

    {

        $cart->items()->delete();

    }



    public function cartBelongsTo(?User $user, ?string $guestToken, Cart $cart): bool

    {

        if ($user !== null) {

            return $cart->user_id === $user->id;

        }



        return $guestToken !== null && $cart->guest_token === $guestToken;

    }



    /**

     * @return array{subtotal: float, discount_amount: float, shipping_amount: float, total: float, item_count: int}

     */

    public function calculateTotals(Cart $cart, ?Coupon $coupon = null): array

    {

        $cart->loadMissing('items');



        $subtotal = round($cart->items->sum(fn (CartItem $item) => $item->lineTotal()), 2);

        $discountAmount = $coupon !== null && $coupon->isValidForAmount($subtotal)

            ? $coupon->calculateDiscount($subtotal)

            : 0.0;

        $shippingAmount = (float) config('commerce.shipping_amount', 0);

        $total = round(max($subtotal - $discountAmount, 0) + $shippingAmount, 2);

        $itemCount = (int) $cart->items->sum('quantity');



        return [

            'subtotal' => $subtotal,

            'discount_amount' => $discountAmount,

            'shipping_amount' => $shippingAmount,

            'total' => $total,

            'item_count' => $itemCount,

        ];

    }



    public function calculateUnitPrice(Shoe $shoe, array $customization): float

    {

        $price = (float) $shoe->base_price;



        if (! empty($customization['material_id'])) {

            $material = Material::query()->find($customization['material_id']);

            if ($material !== null && $shoe->materials()->whereKey($material->id)->exists()) {

                $price += (float) $material->price_modifier;

            }

        }



        if (! empty($customization['buckle_id'])) {

            $buckle = Buckle::query()->find($customization['buckle_id']);

            if ($buckle !== null && $shoe->buckles()->whereKey($buckle->id)->exists()) {

                $price += (float) $buckle->price_modifier;

            }

        }



        return round($price, 2);

    }



    public function validateCustomization(Shoe $shoe, array $customization): void

    {

        $validator = validator($customization, [

            'material_id' => ['required', 'integer', 'exists:materials,id'],

            'color_hex' => ['required', 'string', 'max:7'],

            'sole_color_hex' => ['required', 'string', 'max:7'],

            'buckle_id' => ['required', 'integer', 'exists:buckles,id'],

            'shoe_type' => ['required', 'string', 'max:50'],

            'size_id' => ['required', 'integer', 'exists:sizes,id'],

        ]);



        if ($validator->fails()) {

            throw ValidationException::withMessages($validator->errors()->toArray());

        }



        $data = $validator->validated();



        if (! in_array($data['shoe_type'], $shoe->supported_types ?? [], true)) {

            throw ValidationException::withMessages([

                'shoe_type' => ['The selected shoe type is not supported for this shoe.'],

            ]);

        }



        if (! $shoe->materials()->whereKey($data['material_id'])->exists()) {

            throw ValidationException::withMessages([

                'material_id' => ['The selected material is not available for this shoe.'],

            ]);

        }



        if (! $shoe->buckles()->whereKey($data['buckle_id'])->exists()) {

            throw ValidationException::withMessages([

                'buckle_id' => ['The selected buckle is not available for this shoe.'],

            ]);

        }



        if (! $shoe->sizes()->whereKey($data['size_id'])->exists()) {

            throw ValidationException::withMessages([

                'size_id' => ['The selected size is not available for this shoe.'],

            ]);

        }



        if (! $shoe->colors()->where('hex_code', $data['color_hex'])->exists()) {

            throw ValidationException::withMessages([

                'color_hex' => ['The selected color is not available for this shoe.'],

            ]);

        }

    }



    /**

     * @param  array<string, mixed>  $customization

     * @return array<string, mixed>

     */

    private function normalizeCustomization(array $customization): array

    {

        return [

            'material_id' => (int) $customization['material_id'],

            'color_hex' => (string) $customization['color_hex'],

            'sole_color_hex' => (string) $customization['sole_color_hex'],

            'buckle_id' => (int) $customization['buckle_id'],

            'shoe_type' => (string) $customization['shoe_type'],

            'size_id' => (int) $customization['size_id'],

        ];

    }

}


