<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::query()->get();

        return Inertia::render('admin/roles', compact('roles'));
    }

    public function create()
    {
    }

    public function store()
    {
    }

    public function show()
    {
    }

    public function edit()
    {
    }

    public function update()
    {
    }

    public function destroy()
    {
    }

    public function forceDestroy()
    {
    }

    public function restore()
    {
    }
}
