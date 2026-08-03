<?php

use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Support\Facades\Route;

function routeMiddleware(string $uri, string $method): array
{
    $route = collect(Route::getRoutes())->first(
        fn ($r) => $r->uri() === $uri && in_array($method, $r->methods())
    );

    expect($route)->not->toBeNull("Route {$method} {$uri} not registered");

    return $route->gatherMiddleware();
}

test('oauth register route is exempt from csrf validation', function () {
    expect(routeMiddleware('oauth/register', 'POST'))->not->toContain(ValidateCsrfToken::class);
});

test('oauth token route is exempt from csrf validation', function () {
    expect(routeMiddleware('oauth/token', 'POST'))->not->toContain(ValidateCsrfToken::class);
});
