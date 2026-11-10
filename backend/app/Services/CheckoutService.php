<?php



namespace App\Services;



use App\Enums\OrderStatus;

use App\Enums\PaymentMethod;

use App\Enums\PaymentStatus;

use App\Models\Cart;

use App\Models\Coupon;

use App\Models\Order;

use App\Models\ShippingAddress;

use App\Models\User;

use Illuminate\Support\Facades\DB;

use Illuminate\Support\Str;

use Illuminate\Validation\ValidationException;



class CheckoutService

{

    public function __construct(

        private readonly CartService $cartService,

        private readonly OrderNumberGenerator $orderNumberGenerator,

    ) {}



    public function validateCoupon(string $code, float $subtotal): Coupon

    {

        $coupon = Coupon::query()

            ->where('code', strtoupper(trim($code)))

            ->first();



        if ($coupon === null) {

            throw ValidationException::withMessages([

                'coupon_code' => ['Invalid coupon code.'],

            ]);

        }



        if (! $coupon->isValidForAmount($subtotal)) {

            throw ValidationException::withMessages([

                'coupon_code' => ['This coupon cannot be applied to the current order.'],

            ]);

        }



        return $coupon;

    }



    /**

     * @param  array<string, mixed>  $shippingAddress

     */

    public function createOrder(

        ?User $user,

        Cart $cart,

        array $shippingAddress,

        PaymentMethod $paymentMethod,

        ?string $couponCode = null,

        ?string $notes = null,

        ?string $guestEmail = null,

    ): Order {

        return DB::transaction(function () use ($user, $cart, $shippingAddress, $paymentMethod, $couponCode, $notes, $guestEmail): Order {

            $cart = $cart->fresh(['items.shoe']);



            if ($cart->items->isEmpty()) {

                throw ValidationException::withMessages([

                    'cart' => ['Your cart is empty.'],

                ]);

            }



            if ($user === null) {

                $emailValidator = validator(['guest_email' => $guestEmail], [

                    'guest_email' => ['required', 'email', 'max:255'],

                ]);



                if ($emailValidator->fails()) {

                    throw ValidationException::withMessages($emailValidator->errors()->toArray());

                }

            }



            $coupon = null;

            $subtotal = round($cart->items->sum(fn ($item) => $item->lineTotal()), 2);



            if ($couponCode !== null && $couponCode !== '') {

                $coupon = $this->validateCoupon($couponCode, $subtotal);

            }



            $totals = $this->cartService->calculateTotals($cart, $coupon);



            $order = Order::query()->create([

                'order_number' => $this->orderNumberGenerator->generate(),

                'user_id' => $user?->id,

                'guest_email' => $user === null ? strtolower(trim((string) $guestEmail)) : null,

                'guest_checkout_token' => $user === null ? (string) Str::uuid() : null,

                'coupon_id' => $coupon?->id,

                'status' => OrderStatus::Pending,

                'payment_method' => $paymentMethod,

                'payment_status' => PaymentStatus::Pending,

                'subtotal' => $totals['subtotal'],

                'discount_amount' => $totals['discount_amount'],

                'shipping_amount' => $totals['shipping_amount'],

                'total' => $totals['total'],

                'shipping_address' => $shippingAddress,

                'notes' => $notes,

            ]);



            foreach ($cart->items as $item) {

                $order->items()->create([

                    'shoe_id' => $item->shoe_id,

                    'shoe_name' => $item->shoe->name,

                    'quantity' => $item->quantity,

                    'customization' => $item->customization,

                    'unit_price' => $item->unit_price,

                    'total_price' => $item->lineTotal(),

                ]);

            }



            if ($coupon !== null) {

                $coupon->increment('used_count');

            }



            $this->cartService->clear($cart);



            return $order->load(['items.shoe', 'coupon']);

        });

    }



    public function resolveShippingAddress(?User $user, ?int $shippingAddressId, ?array $inlineAddress): array

    {

        if ($user !== null && $shippingAddressId !== null) {

            $address = ShippingAddress::query()

                ->where('user_id', $user->id)

                ->findOrFail($shippingAddressId);



            return $address->toOrderSnapshot();

        }



        if ($inlineAddress === null) {

            throw ValidationException::withMessages([

                'shipping_address' => ['A shipping address is required.'],

            ]);

        }



        $validator = validator($inlineAddress, [

            'full_name' => ['required', 'string', 'max:255'],

            'phone' => ['nullable', 'string', 'max:30'],

            'address_line_1' => ['required', 'string', 'max:255'],

            'address_line_2' => ['nullable', 'string', 'max:255'],

            'city' => ['required', 'string', 'max:255'],

            'state' => ['nullable', 'string', 'max:255'],

            'postal_code' => ['required', 'string', 'max:20'],

            'country' => ['nullable', 'string', 'max:2'],

        ]);



        if ($validator->fails()) {

            throw ValidationException::withMessages($validator->errors()->toArray());

        }



        $validated = $validator->validated();

        $validated['country'] = strtoupper($validated['country'] ?? config('commerce.default_country', 'PK'));



        return $validated;

    }

}


