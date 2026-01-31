<?php

namespace App\Http\Controllers;

use App\Models\Deployment;

class DeploymentController extends Controller
{
    public function index()
    {
        return Deployment::query()
            ->public()
            ->active()
            ->with(['primaryImage', 'project:id,title,slug'])
            ->ordered()
            ->get();
    }

    public function show(string $slug)
    {
        $deployment = Deployment::query()
            ->public()
            ->where('slug', $slug)
            ->with(['images' => fn ($q) => $q->ordered(), 'project:id,title,slug'])
            ->firstOrFail();

        return response()->json([
            'deployment' => $deployment,
        ]);
    }
}
