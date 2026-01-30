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

    public function show(Deployment $deployment)
    {
        if (! $deployment->is_public) {
            abort(404);
        }

        $deployment->load(['images' => fn ($q) => $q->ordered(), 'project:id,title,slug']);

        return response()->json([
            'deployment' => $deployment,
        ]);
    }
}
