<?php



namespace App\Http\Controllers\Api\V1;



use App\Http\Controllers\Concerns\ResolvesCart;

use App\Http\Controllers\Controller;

use App\Services\CartService;

use App\Services\CheckoutService;

use App\Support\ApiResponse;

use Illuminate\Http\JsonResponse;

use Illuminate\Http\Request;



class CouponController extends Controller

{

    use ResolvesCart;



    public function __construct(

        private readonly CheckoutService $checkoutService,

        private readonly CartService $cartService,

    ) {}



    public function validate(Request $request): JsonResponse

    {

        $validated = $request->validate([

            'code' => ['required', 'string', 'max:50'],

            'subtotal' => ['sometimes', 'numeric', 'min:0'],

        ]);



        $subtotal = isset($validated['subtotal'])

            ? (float) $validated['subtotal']

            : $this->resolveCartSubtotal($request);



        $coupon = $this->checkoutService->validateCoupon($validated['code'], $subtotal);



        return ApiResponse::success([

            'code' => $coupon->code,

            'type' => $coupon->type->value,

            'value' => (float) $coupon->value,

            'min_order_amount' => (float) $coupon->min_order_amount,

            'discount_amount' => $coupon->calculateDiscount($subtotal),

        ], 'Coupon is valid.');

    }



    private function resolveCartSubtotal(Request $request): float

    {

        $cart = $this->resolveCart($request, $this->cartService);

        $totals = $this->cartService->calculateTotals($cart);



        return $totals['subtotal'];

    }

}


