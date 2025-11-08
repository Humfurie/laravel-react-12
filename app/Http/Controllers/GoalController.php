<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GoalController extends Controller
{
    /**
     * Get goals based on user authentication
     * - Non-authenticated: Returns public goals only
     * - Authenticated: Returns all their own goals (public + private)
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            // Non-authenticated users see only public goals
            $goals = Goal::with('user:id,name')
                ->public()
                ->ordered()
                ->get();
        } else {
            // Authenticated users see their own goals (all)
            $goals = Goal::where('user_id', $user->id)
                ->ordered()
                ->get();
        }

        return response()->json([
            'goals' => $goals,
        ]);
    }

    /**
     * Store a new goal
     * Requires authentication and 'create' permission
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$user->hasPermission('goal', 'create')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'is_public' => 'boolean',
            'priority' => 'in:none,low,medium,high',
            'due_date' => 'nullable|date',
        ]);

        // Get the highest order for this user's goals
        $maxOrder = Goal::where('user_id', $user->id)->max('order') ?? -1;

        $goal = Goal::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'notes' => $validated['notes'] ?? null,
            'is_public' => $validated['is_public'] ?? false,
            'priority' => $validated['priority'] ?? 'none',
            'due_date' => $validated['due_date'] ?? null,
            'order' => $maxOrder + 1,
        ]);

        return response()->json([
            'message' => 'Goal created successfully',
            'goal' => $goal->fresh('user'),
        ], 201);
    }

    /**
     * Toggle goal completion status
     * Requires authentication and ownership (or super admin)
     */
    public function toggle(Request $request, Goal $goal): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$goal->canBeUpdatedBy($user)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $goal->toggleCompletion();

        return response()->json([
            'message' => 'Goal updated successfully',
            'goal' => $goal->fresh('user'),
        ]);
    }

    /**
     * Delete a goal
     * Requires authentication and ownership (or super admin)
     */
    public function destroy(Request $request, Goal $goal): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$goal->canBeDeletedBy($user)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $goal->delete();

        return response()->json([
            'message' => 'Goal deleted successfully',
        ]);
    }

    /**
     * Reorder goals
     * Requires authentication
     */
    public function reorder(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$user->hasPermission('goal', 'update')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'goals' => 'required|array',
            'goals.*.id' => 'required|exists:goals,id',
            'goals.*.order' => 'required|integer',
        ]);

        foreach ($validated['goals'] as $goalData) {
            $goal = Goal::find($goalData['id']);

            // Only allow reordering own goals
            if ($goal && $goal->user_id === $user->id) {
                $goal->update(['order' => $goalData['order']]);
            }
        }

        return response()->json([
            'message' => 'Goals reordered successfully',
        ]);
    }

    /**
     * Update goal details
     * Requires authentication and ownership
     */
    public function update(Request $request, Goal $goal): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$goal->canBeUpdatedBy($user)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'notes' => 'nullable|string',
            'is_public' => 'boolean',
            'priority' => 'in:none,low,medium,high',
            'due_date' => 'nullable|date',
            'order' => 'sometimes|integer',
        ]);

        $goal->update($validated);

        return response()->json([
            'message' => 'Goal updated successfully',
            'goal' => $goal->fresh('user'),
        ]);
    }
}
