<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UserController extends Controller
{
    use AuthorizesRequests;

    public function index(): Response
    {
        $this->authorize('viewAny', User::class);
        $users = User::with('roles')
            ->withTrashed()
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at?->toDateString(),
                    'roles' => $user->roles->map(fn($role) => [
                        'id' => $role->id,
                        'name' => $role->name,
                        'slug' => $role->slug,
                    ])->toArray(),
                    'role_ids' => $user->roles->pluck('id')->toArray(),
                    'is_super_admin' => $user->id === 1,
                    'created_at' => $user->created_at->toDateString(),
                    'deleted_at' => $user->deleted_at ? $user->deleted_at->toDateString() : null,
                    'can_edit' => auth()->user()->can('update', $user),
                    'can_delete' => auth()->user()->can('delete', $user),
                    'can_assign_role' => auth()->user()->can('assignRole', $user),
                ];
            });

        $roles = Role::all(['id', 'name', 'slug']);

        return Inertia::render('admin/user', [
            'users' => $users,
            'roles' => $roles,
            'can' => [
                'create' => auth()->user()->can('create', User::class),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'email_verified_at' => now(),
                ]);

                if ($request->has('role_ids') && is_array($request->role_ids)) {
                    $user->roles()->attach($request->role_ids);
                }
            });

            return redirect()->back()->with('success', 'User created successfully.');
        } catch (Throwable $e) {
            return redirect()->back()->with('error', 'Failed to create user: ' . $e->getMessage());
        }
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        try {
            DB::transaction(function () use ($request, $user) {
                $updateData = [
                    'name' => $request->name,
                    'email' => $request->email,
                ];

                if ($request->filled('password')) {
                    $updateData['password'] = Hash::make($request->password);
                }

                $user->update($updateData);

                // Handle role assignment separately with authorization
                if ($request->has('role_ids')) {
                    // Check if user can assign roles to this user
                    if ($user->id === 1) {
                        // User ID 1 cannot have roles changed
                        // Silently ignore role changes for user ID 1
                        return;
                    }

                    if (auth()->user()->can('assignRole', $user)) {
                        $user->roles()->sync($request->role_ids);
                    }
                }
            });

            return redirect()->back()->with('success', 'User updated successfully.');
        } catch (Throwable $e) {
            return redirect()->back()->with('error', 'Failed to update user: ' . $e->getMessage());
        }
    }

    /**
     * Assign roles to a user.
     * User ID 1 cannot have their roles changed.
     */
    public function assignRole(Request $request, User $user): RedirectResponse
    {
        $this->authorize('assignRole', $user);

        $request->validate([
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        try {
            $user->roles()->sync($request->role_ids);

            return redirect()->back()->with('success', 'User roles updated successfully.');
        } catch (Throwable $e) {
            return redirect()->back()->with('error', 'Failed to update user roles: ' . $e->getMessage());
        }
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        try {
            $user->delete();

            return redirect()->back()->with('success', 'User deleted successfully.');
        } catch (Throwable $e) {
            return redirect()->back()->with('error', 'Failed to delete user: ' . $e->getMessage());
        }
    }

    public function restore(User $user): RedirectResponse
    {
        $this->authorize('restore', $user);

        try {
            $user->restore();

            return redirect()->back()->with('success', 'User restored successfully.');
        } catch (Throwable $e) {
            return redirect()->back()->with('error', 'Failed to restore user: ' . $e->getMessage());
        }
    }

    public function forceDestroy(User $user): RedirectResponse
    {
        $this->authorize('forceDelete', $user);

        try {
            $user->roles()->detach();
            $user->forceDelete();

            return redirect()->back()->with('success', 'User permanently deleted.');
        } catch (Throwable $e) {
            return redirect()->back()->with('error', 'Failed to permanently delete user: ' . $e->getMessage());
        }
    }
}
