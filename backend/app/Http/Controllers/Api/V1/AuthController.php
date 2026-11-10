<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('Validation failed.', 422, $validator->errors());
        }

        $user = User::query()->create([
            ...$validator->validated(),
            'role' => UserRole::Customer,
        ]);

        $token = Auth::guard('api')->login($user);

        return ApiResponse::success([
            'user' => $this->transformUser($user),
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
        ], 'Registration successful.', 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! $token = Auth::guard('api')->attempt($credentials)) {
            return ApiResponse::error('Invalid credentials.', 401);
        }

        return ApiResponse::success([
            'user' => $this->transformUser(Auth::guard('api')->user()),
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
        ], 'Login successful.');
    }

    public function me(): JsonResponse
    {
        return ApiResponse::success($this->transformUser(Auth::guard('api')->user()));
    }

    public function logout(): JsonResponse
    {
        Auth::guard('api')->logout();

        return ApiResponse::success(null, 'Logged out successfully.');
    }

    public function refresh(): JsonResponse
    {
        return ApiResponse::success([
            'token' => Auth::guard('api')->refresh(),
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
        ], 'Token refreshed.');
    }

    private function transformUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role->value,
        ];
    }
}
