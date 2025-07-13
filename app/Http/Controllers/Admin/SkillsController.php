<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSkillsRequest;
use App\Http\Requests\UpdateSkillsRequest;
use App\Models\Skill;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SkillsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $skills = Skill::all();

        return Inertia::render('admin/skills', [
            'skills' => $skills,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/skills');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSkillsRequest $request)
    {
        $skill = Skill::create([
            'user_id' => auth()->id(),
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'category' => $request->category,
            'proficiency' => $request->proficiency,
            'is_featured' => $request->boolean('is_featured'),
        ]);

        return redirect()->route('skills.index')->with('success', 'Skill created successfully!');

    }

    /**
     * Display the specified resource.
     */
    public function show(Skill $skill)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Skill $skill)
    {
        return Inertia::render('admin/skills', [
            'skills' => $skill,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSkillsRequest $request, Skill $skill)
    {
        $skill->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'category' => $request->category,
            'proficiency' => $request->proficiency,
            'is_featured' => $request->boolean('is_featured'),
        ]);

        return redirect()->route('skills.index')->with('success', 'Skill updated successfully!');

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Skill $skill)
    {
        $skill->delete();

        return redirect()->route('skills.index')->with('success', 'Skill deleted successfully!');

    }
}
