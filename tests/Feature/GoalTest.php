<?php

use App\Models\Goal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('unauthenticated users can view public goals', function () {
    $user = User::factory()->create();

    // Create public and private goals
    $publicGoal = Goal::factory()->create([
        'user_id' => $user->id,
        'is_public' => true,
        'title' => 'Public Goal',
    ]);

    $privateGoal = Goal::factory()->create([
        'user_id' => $user->id,
        'is_public' => false,
        'title' => 'Private Goal',
    ]);

    $response = $this->getJson('/api/goals');

    $response->assertOk()
        ->assertJsonCount(1, 'goals')
        ->assertJsonPath('goals.0.title', 'Public Goal');
});

test('authenticated users can view their own goals', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    // Create user's own goals
    $myGoal = Goal::factory()->create([
        'user_id' => $user->id,
        'is_public' => false,
        'title' => 'My Private Goal',
    ]);

    // Create another user's public goal
    $otherGoal = Goal::factory()->create([
        'user_id' => $otherUser->id,
        'is_public' => true,
        'title' => 'Other User Goal',
    ]);

    $response = $this->actingAs($user)->getJson('/api/goals');

    $response->assertOk()
        ->assertJsonCount(1, 'goals')
        ->assertJsonPath('goals.0.title', 'My Private Goal');
});

test('authenticated users with permission can create goals', function () {
    $user = createAdminUser('goal');

    $response = $this->actingAs($user)->postJson('/api/goals', [
        'title' => 'New Goal',
        'notes' => 'This is a test goal',
        'due_date' => now()->addDays(7)->format('Y-m-d'),
        'is_public' => false,
    ]);

    $response->assertCreated()
        ->assertJsonPath('goal.title', 'New Goal')
        ->assertJsonPath('goal.notes', 'This is a test goal');

    $this->assertDatabaseHas('goals', [
        'title' => 'New Goal',
        'user_id' => $user->id,
    ]);
});

test('title is required when creating a goal', function () {
    $user = createAdminUser('goal');

    $response = $this->actingAs($user)->postJson('/api/goals', [
        'notes' => 'No title provided',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['title']);
});

test('users can toggle their own goal completion', function () {
    $user = createAdminUser('goal');

    $goal = Goal::factory()->create([
        'user_id' => $user->id,
        'completed' => false,
    ]);

    $response = $this->actingAs($user)->patchJson("/api/goals/{$goal->id}/toggle");

    $response->assertOk()
        ->assertJsonPath('goal.completed', true);

    $this->assertDatabaseHas('goals', [
        'id' => $goal->id,
        'completed' => true,
    ]);

    $goal->refresh();
    expect($goal->completed_at)->not->toBeNull();
});

test('users cannot toggle other users goals', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $goal = Goal::factory()->create([
        'user_id' => $otherUser->id,
    ]);

    $response = $this->actingAs($user)->patchJson("/api/goals/{$goal->id}/toggle");

    $response->assertForbidden();
});

test('users can toggle public visibility on their own goals', function () {
    $user = createAdminUser('goal');

    $goal = Goal::factory()->create([
        'user_id' => $user->id,
        'is_public' => false,
    ]);

    $response = $this->actingAs($user)->patchJson("/api/goals/{$goal->id}", [
        'is_public' => true,
    ]);

    $response->assertOk()
        ->assertJsonPath('goal.is_public', true);

    $this->assertDatabaseHas('goals', [
        'id' => $goal->id,
        'is_public' => true,
    ]);
});

test('admin can edit goal title notes and due date', function () {
    $admin = User::factory()->create(['id' => 1]);
    $user = User::factory()->create();

    $goal = Goal::factory()->create([
        'user_id' => $user->id,
        'title' => 'Original Title',
        'notes' => 'Original notes',
        'due_date' => now()->addDays(5),
    ]);

    $newDueDate = now()->addDays(10)->format('Y-m-d');

    $response = $this->actingAs($admin)->patchJson("/api/goals/{$goal->id}", [
        'title' => 'Updated Title',
        'notes' => 'Updated notes',
        'due_date' => $newDueDate,
    ]);

    $response->assertOk()
        ->assertJsonPath('goal.title', 'Updated Title')
        ->assertJsonPath('goal.notes', 'Updated notes');

    $this->assertDatabaseHas('goals', [
        'id' => $goal->id,
        'title' => 'Updated Title',
        'notes' => 'Updated notes',
    ]);
});

test('users can delete their own goals', function () {
    $user = createAdminUser('goal');

    $goal = Goal::factory()->create([
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user)->deleteJson("/api/goals/{$goal->id}");

    $response->assertOk();

    $this->assertSoftDeleted('goals', [
        'id' => $goal->id,
    ]);
});

test('super admin can delete any users goals', function () {
    $admin = User::factory()->create(['id' => 1]);
    $user = User::factory()->create();

    $goal = Goal::factory()->create([
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($admin)->deleteJson("/api/goals/{$goal->id}");

    $response->assertOk();

    $this->assertSoftDeleted('goals', [
        'id' => $goal->id,
    ]);
});

test('regular users cannot delete other users goals', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $goal = Goal::factory()->create([
        'user_id' => $otherUser->id,
    ]);

    $response = $this->actingAs($user)->deleteJson("/api/goals/{$goal->id}");

    $response->assertForbidden();
});

test('goals are ordered by order column and creation date', function () {
    $user = User::factory()->create();

    $goal1 = Goal::factory()->create([
        'user_id' => $user->id,
        'title' => 'Third',
        'order' => 2,
    ]);

    $goal2 = Goal::factory()->create([
        'user_id' => $user->id,
        'title' => 'First',
        'order' => 0,
    ]);

    $goal3 = Goal::factory()->create([
        'user_id' => $user->id,
        'title' => 'Second',
        'order' => 1,
    ]);

    $response = $this->actingAs($user)->getJson('/api/goals');

    $response->assertOk()
        ->assertJsonPath('goals.0.title', 'First')
        ->assertJsonPath('goals.1.title', 'Second')
        ->assertJsonPath('goals.2.title', 'Third');
});

test('completed goals can be filtered', function () {
    $user = User::factory()->create();

    $activeGoal = Goal::factory()->create([
        'user_id' => $user->id,
        'completed' => false,
    ]);

    $completedGoal = Goal::factory()->create([
        'user_id' => $user->id,
        'completed' => true,
    ]);

    $goals = Goal::where('user_id', $user->id)
        ->incomplete()
        ->get();

    expect($goals)->toHaveCount(1)
        ->and($goals->first()->id)->toBe($activeGoal->id);

    $completed = Goal::where('user_id', $user->id)
        ->completed()
        ->get();

    expect($completed)->toHaveCount(1)
        ->and($completed->first()->id)->toBe($completedGoal->id);
});

test('admin page shows all goals for super admin', function () {
    $admin = User::factory()->create(['id' => 1]); // Super admin
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    Goal::factory()->create(['user_id' => $admin->id]);
    Goal::factory()->create(['user_id' => $user1->id]);
    Goal::factory()->create(['user_id' => $user2->id]);

    $response = $this->actingAs($admin)->get('/admin/goals');

    $response->assertOk();

    // Check that goals prop contains all 3 goals
    $goals = $response->viewData('page')['props']['goals'];
    expect($goals)->toHaveCount(3);
});

test('admin page shows only own goals for regular users', function () {
    $user = createAdminUser('goal');
    $otherUser = User::factory()->create();

    Goal::factory()->create(['user_id' => $user->id]);
    Goal::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($user)->get('/admin/goals');

    $response->assertOk();

    // Check that goals prop contains only 1 goal
    $goals = $response->viewData('page')['props']['goals'];
    expect($goals)->toHaveCount(1);
});
