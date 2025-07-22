<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

test('admin can get all role', function () {
    $roles = Role::factory()->count(5)->create();

    $user = User::factory()->createOne();
    $user->roles()->attach($roles->pluck('id')->first());
    $this->actingAs($user);

    $response = $this->get('/roles');

    $response->assertStatus(200)
        ->assertInertia(fn(AssertableInertia $page) => $page
            ->component('admin/role') // The React component name
            ->has('roles', 5) // Assert we have 5 roles
            ->has('roles.0.name') // Assert first role has name property
        );

});

test('admin can create role', function () {
    $role = Role::factory()->createOne();

    $user = User::factory()->createOne();
    $user->roles()->attach($role->id);
    $this->actingAs($user);

    $inputRole = [
        'name' => 'Admin',
        'slug' => 'admin',
    ];

    $response = $this->post('/roles', $inputRole);

    $response->assertStatus(302)
        ->assertRedirect('/roles');

    $this->assertDatabaseHas('roles', [
        'name' => $inputRole['name'],
        'slug' => $inputRole['slug']
    ]);
})->only();

test('admin can update role', function () {
    $role = Role::factory()->create([
        'name' => 'Editor',
        'slug' => 'editor'
    ]);

    $updatedData = [
        'name' => 'Updated Editor',
        'slug' => 'updated-editor'
    ];

    $response = $this->put('/roles/' . $role->id, $updatedData);

    $response->assertStatus(200)
        ->assertRedirect('/roles');

    $this->assertDatabaseHas('roles', [
        'id' => $role->id,
        'name' => 'Updated Editor',
        'slug' => 'updated-editor'
    ]);
});

test('admin can delete role', function () {
    $role = Role::factory()->create();

    $response = $this->delete('/roles/' . $role->id);

    $response->assertStatus(200)
        ->assertRedirect('/roles');

    $this->assertSoftDeleted('roles', [
        'id' => $role->id
    ]);
});

test('admin can force delete role', function () {
    $role = Role::factory()->create();
    $role->delete(); // Soft delete first

    $response = $this->delete('/roles/' . $role->id . '/force');

    $response->assertStatus(200)
        ->assertRedirect('/roles');

    $this->assertDatabaseMissing('roles', [
        'id' => $role->id
    ]);
});


