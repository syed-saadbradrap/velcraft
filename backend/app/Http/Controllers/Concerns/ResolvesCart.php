<?php



namespace App\Http\Controllers\Concerns;



use App\Models\CartItem;

use App\Models\User;

use App\Services\CartService;

use App\Support\GuestContext;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;

use Illuminate\Validation\ValidationException;



trait ResolvesCart

{

    protected function optionalUser(): ?User

    {

        /** @var User|null $user */

        $user = Auth::guard('api')->user();



        return $user;

    }



    protected function resolveCart(Request $request, CartService $cartService)

    {

        return $cartService->resolveCart(

            $this->optionalUser(),

            GuestContext::cartTokenFromRequest($request),

        );

    }



    protected function authorizeCartItem(

        Request $request,

        CartService $cartService,

        CartItem $cartItem,

    ): void {

        $cartItem->loadMissing('cart');



        if ($cartService->cartBelongsTo(

            $this->optionalUser(),

            GuestContext::cartTokenFromRequest($request),

            $cartItem->cart,

        )) {

            return;

        }



        throw ValidationException::withMessages([

            'cart_item' => ['This cart item does not belong to your cart.'],

        ]);

    }

}


