<?php



namespace App\Support;



use Illuminate\Http\Request;

use Illuminate\Support\Str;

use Illuminate\Validation\ValidationException;



class GuestContext

{

    public const CART_HEADER = 'X-Guest-Token';



    public const CHECKOUT_HEADER = 'X-Guest-Checkout-Token';



    public static function cartTokenFromRequest(Request $request): ?string

    {

        return self::parseToken($request->header(self::CART_HEADER), 'guest_token');

    }



    public static function checkoutTokenFromRequest(Request $request): ?string

    {

        return self::parseToken($request->header(self::CHECKOUT_HEADER), 'guest_checkout_token');

    }



    private static function parseToken(?string $token, string $field): ?string

    {

        if ($token === null || $token === '') {

            return null;

        }



        if (! Str::isUuid($token)) {

            throw ValidationException::withMessages([

                $field => ['Invalid guest token.'],

            ]);

        }



        return $token;

    }

}


