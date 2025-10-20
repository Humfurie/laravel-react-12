<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExperienceRequest;
use App\Http\Requests\UpdateExperienceRequest;
use App\Models\Experience;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class ExperienceController extends Controller
{
    use AuthorizesRequests;

    /**
     * Get public experiences (API endpoint).
     */
    public function public()
    {
        $experiences = Experience::with('image')
            ->ordered()
            ->get();

        return response()->json($experiences);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $experiences = Experience::with('image')
            ->where('user_id', auth()->id())
            ->ordered()
            ->get();

        return Inertia::render('Admin/Experience/Index', [
            'experiences' => $experiences,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Experience $experience)
    {
        $this->authorize('update', $experience);

        $experience->load('image');

        return Inertia::render('Admin/Experience/Edit', [
            'experience' => $experience,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateExperienceRequest $request, Experience $experience)
    {
        $this->authorize('update', $experience);

        $validated = $request->validated();
        $experience->update($validated);

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($experience->image) {
                $experience->image->delete();
            }

            $path = $request->file('image')->store('experiences', 'public');
            $experience->image()->create([
                'name' => $request->file('image')->getClientOriginalName(),
                'path' => $path,
            ]);
        }

        return redirect()
            ->route('admin.experiences.index')
            ->with('success', 'Experience updated successfully.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreExperienceRequest $request)
    {
        $validated = $request->validated();

        $experience = Experience::create([
            'user_id' => auth()->id(),
            ...$validated,
        ]);

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('experiences', 'public');
            $experience->image()->create([
                'name' => $request->file('image')->getClientOriginalName(),
                'path' => $path,
            ]);
        }

        return redirect()
            ->route('admin.experiences.index')
            ->with('success', 'Experience created successfully.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Experience/Create');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Experience $experience)
    {
        $this->authorize('delete', $experience);

        $experience->delete();

        return redirect()
            ->route('admin.experiences.index')
            ->with('success', 'Experience deleted successfully.');
    }
}
