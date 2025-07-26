<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermissionController extends Controller
{
    public function index()
    {
        $permissions = Permission::all();

        return Inertia::render('admin/permissions', [
            'permissions' => $permissions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'resource' => 'required|string|max:255|unique:permissions,resource',
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

        $permission = Permission::create([
            'resource' => $validated['resource'],
            'actions' => $actions // Auto-add default actions
        ]);

        return redirect()->route('admin/permission')
            ->with('success', 'Permission created successfully.');
    }

    public function update(Request $request, Permission $permission)
    {
    }

    public function destroy(Permission $permission)
    {
    }

    public function restore(Request $request, Permission $permission)
    {
    }

    public function forceDelete(Permission $permission)
    {
    }
}
