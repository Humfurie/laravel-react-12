<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AboutController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/about', []);
    }

    public function store()
    {
    }

    public function listHistory()
    {
    }


    public function showHistory()
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

    public function setPrimary()
    {
    }

}
