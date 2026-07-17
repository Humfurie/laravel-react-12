<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TechnologyRequest;
use App\Http\Resources\TechnologyResource;
use App\Models\Technology;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Attributes\Controllers\Authorize;

class TechnologyController extends Controller
{
    use AuthorizesRequests;

    #[Authorize('viewAny', Technology::class)]
    public function index()
    {
        return TechnologyResource::collection(Technology::all());
    }

    #[Authorize('create', Technology::class)]
    public function store(TechnologyRequest $request)
    {
        return new TechnologyResource(Technology::create($request->validated()));
    }

    public function show(Technology $technology)
    {
        $this->authorize('view', $technology);

        return new TechnologyResource($technology);
    }

    public function update(TechnologyRequest $request, Technology $technology)
    {
        $this->authorize('update', $technology);

        $technology->update($request->validated());

        return new TechnologyResource($technology);
    }

    public function destroy(Technology $technology)
    {
        $this->authorize('delete', $technology);

        $technology->delete();

        return response()->json();
    }
}
