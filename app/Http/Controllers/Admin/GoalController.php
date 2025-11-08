<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Goal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GoalController extends Controller
{
    /**
     * Display a listing of goals
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Admin sees all goals, regular users see only their own
        $query = Goal::with('user:id,name');

        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        $goals = $query->ordered()->get();

        return Inertia::render('admin/goals/index', [
            'goals' => $goals,
        ]);
    }
}
