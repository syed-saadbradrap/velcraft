<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Password::defaults(function () {
            return Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers();
        });

        RateLimiter::for('auth', function (Request $request) {
            $key = $request->ip().'|'.strtolower((string) $request->input('email'));

            return Limit::perMinute(5)->by($key);
        });

        RateLimiter::for('contact', fn (Request $request) => Limit::perMinute(3)->by($request->ip()));

        RateLimiter::for('newsletter', fn (Request $request) => Limit::perMinute(3)->by($request->ip()));

        RateLimiter::for('coupons', fn (Request $request) => Limit::perMinute(10)->by($request->ip()));
    }
}
