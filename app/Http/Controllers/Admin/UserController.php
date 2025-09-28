<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use DB;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::with('roles')
            ->withTrashed()
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at?->toDateString(),
                    'roles' => $user->roles->pluck('name')->toArray(),
                    'created_at' => $user->created_at->toDateString(),
                    'deleted_at' => $user->deleted_at ? $user->deleted_at->toDateString() : null,
                ];
            });

        $roles = Role::all(['id', 'name']);

        return Inertia::render('admin/user', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'roles' => 'array',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'email_verified_at' => now(),
                ]);

                if ($request->has('roles')) {
                    $roles = Role::whereIn('name', $request->roles)->get();
                    $user->roles()->attach($roles->pluck('id'));
                }
            });

            return redirect()->back()->with('success', 'User created successfully.');
        } catch (Throwable $e) {
            return redirect()->back()->with('error', 'Failed to create user: ' . $e->getMessage());
        }
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'roles' => 'array',
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

                if ($request->has('roles')) {
                    $roles = Role::whereIn('name', $request->roles)->get();
                    $user->roles()->sync($roles->pluck('id'));
                }
            });

            return redirect()->back()->with('success', 'User updated successfully.');
        } catch (Throwable $e) {
            return redirect()->back()->with('error', 'Failed to update user: ' . $e->getMessage());
        }
    }

    public function destroy(User $user): RedirectResponse
    {
        try {
            $user->delete();
            return redirect()->back()->with('success', 'User deleted successfully.');
        } catch (Throwable $e) {
            return redirect()->back()->with('error', 'Failed to delete user: ' . $e->getMessage());
        }
    }

    public function restore(User $user): RedirectResponse
    {
        try {
            $user->restore();
            return redirect()->back()->with('success', 'User restored successfully.');
        } catch (Throwable $e) {
            return redirect()->back()->with('error', 'Failed to restore user: ' . $e->getMessage());
        }
    }

    public function forceDestroy(User $user): RedirectResponse
    {
        try {
            $user->roles()->detach();
            $user->forceDelete();
            return redirect()->back()->with('success', 'User permanently deleted.');
        } catch (Throwable $e) {
            return redirect()->back()->with('error', 'Failed to permanently delete user: ' . $e->getMessage());
        }
    }
}
