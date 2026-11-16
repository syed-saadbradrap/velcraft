<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

$basePath = dirname(__DIR__);

// Load .env before withRouting() captures apiPrefix (otherwise empty API_PREFIX=
// is missed and Laravel defaults to "api", breaking public_html/api URI stripping).
if (is_file($basePath.'/.env')) {
    Dotenv\Dotenv::createImmutable($basePath)->safeLoad();
}

$apiPrefix = array_key_exists('API_PREFIX', $_ENV)
    ? (string) $_ENV['API_PREFIX']
    : (array_key_exists('API_PREFIX', $_SERVER) ? (string) $_SERVER['API_PREFIX'] : 'api');

return Application::configure(basePath: $basePath)
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: $apiPrefix,
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \App\Http\Middleware\ForceJsonResponse::class,
            \App\Http\Middleware\SecurityHeaders::class,
        ]);

        $middleware->throttleApi('120,1');

        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
            'optional.jwt' => \App\Http\Middleware\OptionalJwtAuth::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
