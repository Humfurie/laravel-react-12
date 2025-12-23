# Route Model Binding Fix

## Issue

When running tests, the following error occurred:

```
Too few arguments to function App\Http\Controllers\CommentController::store(),
2 passed in .../Illuminate/Routing/ControllerDispatcher.php on line 46
and exactly 3 expected

at tests/Feature/CommentTest.php:308
```

This occurred specifically on the test:

```php
public function comments_work_on_giveaways_too()
{
    $giveaway = Giveaway::factory()->create(['status' => 'active']);

    $response = $this->actingAs($this->user)
        ->postJson("/giveaways/{$giveaway->id}/comments", [
            'content' => 'Comment on giveaway',
        ]);

    $response->assertStatus(201); // Failed here
}
```

## Root Cause

The `CommentController::store()` method signature was incompatible with Laravel's route model binding.

### Routes Configuration

```php
// routes/web.php
Route::post('/blogs/{blog}/comments', [CommentController::class, 'store']);
Route::post('/giveaways/{giveaway}/comments', [CommentController::class, 'store']);
```

Laravel's route model binding automatically resolves route parameters like `{blog}` and `{giveaway}` to their respective
model instances and injects them into controller methods.

### Original Method Signature (INCORRECT)

```php
public function store(StoreCommentRequest $request, string $type, int $id): JsonResponse
{
    // Expected: $type = 'blog' or 'giveaway', $id = integer
    // Reality: Laravel was trying to inject model instances

    $commentable = match ($type) {
        'blog' => Blog::findOrFail($id),
        'giveaway' => Giveaway::findOrFail($id),
        default => abort(404)
    };
}
```

**Problem**: The method expected `string $type` and `int $id`, but Laravel's route model binding was trying to inject a
`Blog` or `Giveaway` model instance. This caused a type mismatch and the "too few arguments" error.

## Solution

Changed the method signature to accept the polymorphic model instance directly using PHP 8.0+ union types:

### Fixed Method Signature (CORRECT)

```php
public function store(StoreCommentRequest $request, Blog|Giveaway $commentable): JsonResponse
{
    // Laravel automatically injects the correct model based on route parameter name:
    // - Route /blogs/{blog}/comments → injects Blog instance
    // - Route /giveaways/{giveaway}/comments → injects Giveaway instance

    // No need for manual lookup or match statement
    $validated = $request->validated();
    // ... rest of the method
}
```

## How It Works

1. **Route Definition**: `POST /blogs/{blog}/comments`
    - Parameter name: `{blog}`
    - Laravel looks for a `Blog` model by ID

2. **Route Model Binding**: Laravel automatically:
    - Finds the Blog model with the given ID
    - Injects it as `$commentable` parameter
    - Type hint `Blog|Giveaway` accepts both Blog and Giveaway instances

3. **Same for Giveaways**: `POST /giveaways/{giveaway}/comments`
    - Parameter name: `{giveaway}`
    - Laravel injects Giveaway model instance

## Benefits

1. **Simpler Code**: No need for manual `findOrFail()` or `match` statements
2. **Type Safety**: PHP 8.0 union types ensure only Blog or Giveaway instances are accepted
3. **Automatic 404**: Laravel handles model not found automatically
4. **Less Error-Prone**: Leverages framework features instead of custom logic
5. **Test Compatibility**: Works perfectly with Laravel's testing helpers

## Files Modified

- `app/Http/Controllers/CommentController.php` (line 23)

## Testing

After this fix, all comment tests should pass:

```bash
php artisan test --filter=CommentTest
```

Expected result:

- ✅ `authenticated_user_can_create_comment`
- ✅ `comments_work_on_giveaways_too`
- ✅ All other comment tests

## Additional Context

This is a common pattern in Laravel when working with polymorphic relationships:

```php
// Multiple routes pointing to same controller method
Route::post('/{commentableType}/{commentable}/comments', [CommentController::class, 'store']);

// Or separate routes (current approach - better for clarity)
Route::post('/blogs/{blog}/comments', [CommentController::class, 'store']);
Route::post('/giveaways/{giveaway}/comments', [CommentController::class, 'store']);
```

The union type approach (`Blog|Giveaway`) is cleaner and more maintainable than:

- String-based type checking
- Separate controller methods for each type
- Custom route model binding resolvers

## References

- Laravel Route Model Binding: https://laravel.com/docs/routing#route-model-binding
- PHP Union Types: https://www.php.net/manual/en/language.types.declarations.php#language.types.declarations.union
