<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TechnologyRequest;
use App\Http\Resources\TechnologyResource;
use App\Models\Technology;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TechnologyController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $this->authorize('viewAny', Technology::class);

        return TechnologyResource::collection(Technology::all());
    }

    public function store(TechnologyRequest $request)
    {
        $this->authorize('create', Technology::class);

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
