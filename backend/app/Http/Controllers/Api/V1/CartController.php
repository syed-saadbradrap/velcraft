<?php



namespace App\Http\Controllers\Api\V1;



use App\Http\Controllers\Concerns\ResolvesCart;

use App\Http\Controllers\Controller;

use App\Http\Resources\CartItemResource;

use App\Http\Resources\CartResource;

use App\Models\CartItem;

use App\Models\Shoe;

use App\Services\CartService;

use App\Support\ApiResponse;

use Illuminate\Http\JsonResponse;

use Illuminate\Http\Request;



class CartController extends Controller

{

    use ResolvesCart;



    public function __construct(private readonly CartService $cartService) {}



    public function index(Request $request): JsonResponse

    {

        $cart = $this->resolveCart($request, $this->cartService);

        $totals = $this->cartService->calculateTotals($cart);



        return ApiResponse::success(new CartResource($cart, $totals));

    }



    public function store(Request $request): JsonResponse

    {

        $validated = $request->validate([

            'shoe_id' => ['required', 'integer', 'exists:shoes,id'],

            'quantity' => ['sometimes', 'integer', 'min:1', 'max:99'],

            'customization' => ['required', 'array'],

        ]);



        $cart = $this->resolveCart($request, $this->cartService);



        $shoe = Shoe::query()

            ->where('is_active', true)

            ->findOrFail($validated['shoe_id']);



        $item = $this->cartService->addItem(

            $cart,

            $shoe,

            $validated['customization'],

            (int) ($validated['quantity'] ?? 1),

        );



        $cart = $cart->fresh(['items.shoe.collection']);

        $totals = $this->cartService->calculateTotals($cart);



        return ApiResponse::success([

            'item' => new CartItemResource($item),

            'cart' => new CartResource($cart, $totals),

        ], 'Item added to cart.', 201);

    }



    public function update(Request $request, CartItem $cartItem): JsonResponse

    {

        $validated = $request->validate([

            'quantity' => ['required', 'integer', 'min:1', 'max:99'],

        ]);



        $this->authorizeCartItem($request, $this->cartService, $cartItem);



        $item = $this->cartService->updateItem($cartItem, $validated['quantity']);

        $cart = $cartItem->cart->fresh(['items.shoe.collection']);

        $totals = $this->cartService->calculateTotals($cart);



        return ApiResponse::success([

            'item' => new CartItemResource($item),

            'cart' => new CartResource($cart, $totals),

        ], 'Cart item updated.');

    }



    public function destroy(Request $request, CartItem $cartItem): JsonResponse

    {

        $this->authorizeCartItem($request, $this->cartService, $cartItem);



        $cart = $cartItem->cart;

        $this->cartService->removeItem($cartItem);



        $cart = $cart->fresh(['items.shoe.collection']);

        $totals = $this->cartService->calculateTotals($cart);



        return ApiResponse::success(new CartResource($cart, $totals), 'Item removed from cart.');

    }



    public function clear(Request $request): JsonResponse

    {

        $cart = $this->resolveCart($request, $this->cartService);

        $this->cartService->clear($cart);



        $cart = $cart->fresh(['items.shoe.collection']);

        $totals = $this->cartService->calculateTotals($cart);



        return ApiResponse::success(new CartResource($cart, $totals), 'Cart cleared.');

    }

}


