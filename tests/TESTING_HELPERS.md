# Testing Helpers Guide

This document explains the helper functions available for creating users with roles and permissions in tests.

## Helper Functions

### `createAdminUser()`

Creates a user with an admin role and specified permissions.

**Syntax:**

```php
createAdminUser(string|array $resources = [], array $actions = ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'])
```

**Parameters:**

- `$resources` (string|array): Resource(s) to grant permissions for (e.g., 'blog', ['blog', 'user'])
- `$actions` (array): Actions to grant. Default includes all CRUD actions.

**Examples:**

```php
// Create admin with blog permissions
$admin = createAdminUser('blog');

// Create admin with multiple resource permissions
$admin = createAdminUser(['blog', 'user', 'property']);

// Create admin with specific actions
$admin = createAdminUser('blog', ['viewAny', 'view', 'create']);

// Create admin without any specific resource (just the role)
$admin = createAdminUser();
```

### `createUserWithRole()`

Creates a user with a custom role and permissions.

**Syntax:**

```php
createUserWithRole(string $roleName, string $roleSlug, string|array $resources, array $actions = ['viewAny', 'view'])
```

**Parameters:**

- `$roleName` (string): Display name of the role (e.g., 'Editor')
- `$roleSlug` (string): Slug of the role (e.g., 'editor')
- `$resources` (string|array): Resource(s) to grant permissions for
- `$actions` (array): Actions to grant. Default includes read-only actions.

**Examples:**

```php
// Create editor with view-only permissions
$editor = createUserWithRole('Editor', 'editor', 'blog', ['viewAny', 'view']);

// Create manager with multiple resources
$manager = createUserWithRole('Manager', 'manager', ['blog', 'property'], ['viewAny', 'view', 'create', 'update']);

// Create viewer with minimal permissions
$viewer = createUserWithRole('Viewer', 'viewer', ['blog', 'property']);
```

## Usage in Tests

### Simple Example

```php
<?php

use App\Models\Blog;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('admin can create blog post', function () {
    // Create admin user with blog permissions
    $admin = createAdminUser('blog');

    // Act as the admin
    $this->actingAs($admin);

    // Test creating a blog post
    $response = $this->post('/admin/blogs', [
        'title' => 'Test Post',
        'content' => 'Test content',
        'status' => 'published'
    ]);

    $response->assertRedirect();
});
```

### Multiple Resources Example

```php
test('admin can manage multiple resources', function () {
    // Create admin with permissions for multiple resources
    $admin = createAdminUser(['blog', 'user', 'property']);

    $this->actingAs($admin);

    // Now can test actions on all three resources
    $this->get('/admin/blogs')->assertOk();
    $this->get('/admin/users')->assertOk();
    $this->get('/admin/properties')->assertOk();
});
```

### Using beforeEach Hook

```php
beforeEach(function () {
    // Create admin user that all tests can use
    $this->admin = createAdminUser(['blog', 'property']);
    $this->actingAs($this->admin);
});

test('can create blog', function () {
    // $this->admin is already authenticated
    $response = $this->post('/admin/blogs', [...]);
    $response->assertRedirect();
});

test('can create property', function () {
    // $this->admin is already authenticated
    $response = $this->post('/admin/properties', [...]);
    $response->assertRedirect();
});
```

### Custom Role Example

```php
test('editor can view but not delete', function () {
    // Create editor with limited permissions
    $editor = createUserWithRole('Editor', 'editor', 'blog', ['viewAny', 'view', 'create', 'update']);

    $this->actingAs($editor);

    // Can view
    $this->get('/admin/blogs')->assertOk();

    // Cannot delete
    $blog = Blog::factory()->create();
    $this->delete("/admin/blogs/{$blog->slug}")
        ->assertForbidden();
});
```

## Migration from Old Pattern

**Old way (verbose):**

```php
$user = User::factory()
    ->has(Role::factory()
        ->state([
            'name' => 'Admin',
            'slug' => 'admin'
        ])->hasAttached(Permission::factory()
            ->state([
                'resource' => 'blog',
            ]), ['actions' => json_encode(['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'], JSON_THROW_ON_ERROR)], 'permissions'))
    ->create();
```

**New way (concise):**

```php
$user = createAdminUser('blog');
```

## Available Resources

Common resources you might use:

- `blog` - Blog posts management
- `user` - User management
- `role` - Role management
- `permission` - Permission management
- `property` - Property management
- `developer` - Developer management
- `project` - Project management

## Default Actions

The default actions for `createAdminUser()` are:

- `viewAny` - View list of resources
- `view` - View single resource
- `create` - Create new resource
- `update` - Update existing resource
- `delete` - Soft delete resource
- `restore` - Restore soft-deleted resource
- `forceDelete` - Permanently delete resource

The default actions for `createUserWithRole()` are:

- `viewAny` - View list of resources
- `view` - View single resource
