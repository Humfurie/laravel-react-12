<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Services\RolePermissionService;
use DB;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use JsonException;
use Throwable;

class RoleController extends Controller
{
    public function __construct(
        protected RolePermissionService $rolePermissionService
    )
    {
    }

    public function index(): Response
    {
        $roles = Role::with('users')
            ->withCount('users')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                    'users_count' => $role->users_count,
                    'permissions' => function () use ($role) {
                        $role_permissions = [];
                        foreach ($role->permissions as $permission) {
                            foreach (json_decode($permission->pivot->actions, false, 512, JSON_THROW_ON_ERROR) as $action) {
                                $role_permissions[] = "$permission->resource.$action";
                            }
                        }
                        return $role_permissions;
                    },
                    'created_at' => $role->created_at->toDateString(),
                ];
            });

        $permissions = Permission::all();

        return Inertia::render('admin/role', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * @throws JsonException|Throwable
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'slug' => 'nullable|string|max:255|unique:roles,slug|regex:/^[a-z0-9-]+$/',
            'permissions' => 'sometimes|array',
        ]);

        // Generate slug from name if slug is null or empty
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        DB::transaction(function () use ($validated) {
            $role = Role::create([
                'name' => $validated['name'],
                'slug' => Str::slug($validated['slug']) ?? Str::slug($validated['name']),
            ]);

            $this->rolePermissionService->managePermissions($validated['permissions'], $role, 'post');
        });

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * @throws Throwable
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'slug' => 'nullable|string|max:255|unique:roles,slug|regex:/^[a-z0-9-]+$/',
            'permissions' => 'sometimes|array',
        ]);

        // Generate slug from name if slug is null or empty
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        Db::transaction(function () use ($role, $validated) {
            $role->update([
                'name' => $validated['name'],
                'slug' => Str::slug($validated['slug']) ?? Str::slug($validated['name']),
            ]);

            $this->rolePermissionService->managePermissions($validated['permissions'], $role, 'sync');
        });

        return redirect()->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }

    public function forceDestroy(Role $role): RedirectResponse
    {
        $role->forceDelete();

        return redirect()->route('roles.index')
            ->with('success', 'Role force deleted successfully.');
    }

    public function restore(Role $role): RedirectResponse
    {
        $role->restore();

        return redirect()->route('roles.index')
            ->with('success', 'Role restored successfully.');
    }

}
