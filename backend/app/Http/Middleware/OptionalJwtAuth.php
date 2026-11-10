<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Symfony\Component\HttpFoundation\Response;

class OptionalJwtAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->bearerToken()) {
            try {
                JWTAuth::parseToken()->authenticate();
            } catch (\Throwable) {
                // Continue as guest when the bearer token is missing or invalid.
            }
        }

        return $next($request);
    }
}
