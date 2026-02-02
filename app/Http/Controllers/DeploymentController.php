<?php

namespace App\Http\Controllers;

use App\Models\Deployment;
use Illuminate\Support\Facades\Cache;

class DeploymentController extends Controller
{
    public function index()
    {
        return Cache::remember(
            config('cache-ttl.keys.listing_deployments'),
            config('cache-ttl.listing.deployments', 1800),
            fn () => Deployment::query()
                ->public()
                ->active()
                ->with(['primaryImage', 'project:id,title,slug'])
                ->ordered()
                ->get()
        );
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
