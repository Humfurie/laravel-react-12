# Admin System Explanation

## How Admin Permissions Work

### User ID 1 is Special (Super Admin)

In your system, **User ID 1 automatically has ALL permissions** without needing a role assigned. This is hardcoded in
the `User` model:

```php
// app/Models/User.php line 49-52
public function isAdmin(): bool
{
    return $this->id === 1;
}
```

This method is checked in:

- `hasRole()` - Returns true for any role check
- `hasPermission()` - Returns true for any permission check
- `getAllPermissions()` - Returns all permissions as true

**Your Account:**

- Email: humfurie@gmail.com
- User ID: 1
- Status: **Automatic Super Admin** (no role needed)
- Has ALL permissions by default

### Role System

Your system uses a custom role-based permission system:

1. **Roles** - Groups of permissions (e.g., "Admin", "Editor")
2. **Permissions** - Resource-based permissions (e.g., "blog", "user", "expertise")
3. **Actions** - What can be done (viewAny, view, create, update, delete, restore, forceDelete)

### Current Roles

```bash
# Check existing roles
./vendor/bin/sail artisan tinker --execute="
    \App\Models\Role::all()->each(function(\$role) {
        echo \$role->name . ' (' . \$role->slug . ')' . PHP_EOL;
    });
"
```

### Permission Resources

The system currently supports these resources in `User::getAllPermissions()`:

- `developer` - Real estate developers
- `project` - Projects (general)
- `realestate-project` - Real estate specific projects
- `property` - Properties
- `blog` - Blog posts
- `user` - User management
- `role` - Role management
- `permission` - Permission management
- `experience` - Work experience
- `expertise` - Skills/expertise (JUST ADDED)
- `skills` - Skills
- `technology` - Technologies

## The Issue You Encountered

### Problem

The "Expertise Management" link wasn't showing in the admin sidebar.

### Root Cause

The `User::getAllPermissions()` method had a hardcoded list of resources (line 116-128), and **`expertise` was missing**
from that list.

Even though:

- ✅ The permission existed in the database
- ✅ Your Admin role had the permission
- ✅ You are User ID 1 (super admin)

The frontend wasn't receiving the expertise permissions because it wasn't included in the `getAllPermissions()` array.

### Solution

Added `'expertise'` to the resources array in `User::getAllPermissions()` (line 126).

## Creating a "Super Admin" Role (Optional)

If you want to create an actual "Super Admin" role instead of relying on User ID 1:

```php
./vendor/bin/sail artisan tinker

$superAdmin = \App\Models\Role::create([
    'name' => 'Super Admin',
    'slug' => 'super-admin',
    'description' => 'Has access to everything'
]);

// Get all permissions
$permissions = \App\Models\Permission::all();

// Attach all permissions with all actions
foreach ($permissions as $permission) {
    $superAdmin->permissions()->attach($permission->id, [
        'actions' => ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete']
    ]);
}

// Assign to your user (optional, since you're already User ID 1)
$user = \App\Models\User::first();
$user->roles()->attach($superAdmin->id);
```

## How Sidebar Menu Works

The sidebar (`app-sidebar.tsx`) checks permissions like this:

```typescript
// Line 88-89
if (item.requiredPermission) {
    return auth.permissions[item.requiredPermission]?.viewAny ?? false;
}
```

For "Expertise Management":

- Requires: `auth.permissions.expertise.viewAny`
- This comes from: `User::getAllPermissions()` → sent via `HandleInertiaRequests`

## Debugging Permissions

### Check what permissions are sent to frontend:

```bash
# In browser console
console.log(usePage().props.auth.permissions);
```

### Check user permissions in backend:

```bash
./vendor/bin/sail artisan tinker --execute="
    \$user = \App\Models\User::find(1);
    \$permissions = \$user->getAllPermissions();
    print_r(array_keys(\$permissions));
"
```

### Check if user has specific permission:

```bash
./vendor/bin/sail artisan tinker --execute="
    \$user = \App\Models\User::find(1);
    echo 'Has expertise viewAny: ' . (\$user->hasPermission('expertise', 'viewAny') ? 'YES' : 'NO');
"
```

## Adding New Resource Permissions

When you add a new resource (like we added "expertise"), you need to:

1. **Create the permission in database** (usually via seeder)
2. **Add routes** with permission middleware
3. **Add to sidebar** with `requiredPermission`
4. **Add to `User::getAllPermissions()`** ← This is the step that was missing!

Example for adding a new "taxonomy" resource:

```php
// In User.php::getAllPermissions()
$resources = [
    // ... existing resources
    'expertise',
    'taxonomy',  // ← Add new resource here
    'skills',
];
```

## Why Not Use a Package?

Your system uses a custom permission system instead of packages like `spatie/laravel-permission` because it:

- Uses a pivot table with JSON actions
- Has granular control over which actions are allowed
- Integrates tightly with Inertia/React frontend

## Summary

✅ **Fixed**: Added `'expertise'` to `User::getAllPermissions()`
✅ **Result**: Expertise Management now shows in sidebar
✅ **Your Status**: User ID 1 = Automatic Super Admin
✅ **No Role Needed**: You have all permissions by default

The "Super Admin" role concept exists in some systems, but your system uses **User ID 1** as the super admin by
convention, which is simpler and works perfectly for single-admin setups.
