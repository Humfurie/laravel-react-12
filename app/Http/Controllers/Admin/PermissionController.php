<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PermissionController extends Controller
{
    public function index(): Response
    {
        $permissions = Permission::all();

        return Inertia::render('admin/permission', [
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'resource' => [
                'required',
                'string',
                'max:255',
                'unique:permissions,resource',
            ],
            'actions' => 'required|array',
        ]);

        $actions = $request->actions ?? [];

        if ($request->all_actions) {
            $actions = [
                'viewAny',  // List/index - view all records
                'view',     // Show - view single record
                'create',   // Create new record
                'update',   // Edit/update existing record
                'delete',   // Delete record
                'restore',  // Restore soft-deleted record
                'forceDelete', // Permanently delete record
            ];
        }

        if ($request->others) {
            $actions[] = $request->others;
        }

        Permission::create([
            'resource' => $validated['resource'],
            'actions' => $actions,
        ]);

        return redirect()->route('permissions.index')
            ->with('success', 'Permission created successfully.');
    }

    public function update(Request $request, Permission $permission): RedirectResponse
    {
        $validated = $request->validate([
            'resource' => [
                'required',
                'string',
                'max:255',
                'unique:permissions,resource,' . $permission->id,
            ],
            'actions' => 'required|array',
        ]);

        $actions = $request->actions ?? [];

        if ($request->all_actions) {
            $actions = [
                'viewAny',  // List/index - view all records
                'view',     // Show - view single record
                'create',   // Create new record
                'update',   // Edit/update existing record
                'delete',   // Delete record
                'restore',  // Restore soft-deleted record
                'forceDelete', // Permanently delete record
            ];
        }

        if ($request->others) {
            $actions[] = $request->others;
        }

        $permission->update([
            'resource' => $validated['resource'],
            'actions' => $actions, // Auto-add default actions
        ]);

        return redirect()->route('permissions.index')
            ->with('success', 'Permission updated successfully.');
    }

    public function destroy(Permission $permission): RedirectResponse
    {
        $permission->delete();

        return redirect()->route('permissions.index')
            ->with('success', 'Permission deleted successfully.');
    }

    public function restore(Request $request, Permission $permission): RedirectResponse
    {
        $permission->restore();

        return redirect()->route('permissions.index')
            ->with('success', 'Permission restored successfully.');
    }

    public function forceDestroy(Permission $permission): RedirectResponse
    {
        $permission->forceDelete();

        return redirect()->route('permissions.index')
            ->with('success', 'Permission force deleted successfully.');
    }
}
