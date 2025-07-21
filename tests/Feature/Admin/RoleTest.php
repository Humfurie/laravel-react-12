<?php


use App\Models\Role;

test('admin can get all role', function () {
    Role::factory()->count(5)->create();

    $response = $this->get('/');


    $response->assertStatus(200)
        ->assertViewIs('roles.index')
        ->assertViewHas('roles')
        ->assertViewHas('roles', function ($roles) {
            return $roles->count() === 5;
        });
});

test('admin can get specific role', function () {
    $role = Role::factory()->createOne();

    $response = $this->get('/' . $role->slug);

    $response->assertViewIs('roles.show')
        ->assertViewHas('role');

    $this->assertEquals([
        'name' => $role->name,
        'slug' => $role->slug
    ], [
        'name' => $response->name,
        'slug' => $response->slug
    ]);

    $this->assertDatabaseHas('roles', ['id' => $role->slug]);

});

test('admin can create role', function () {
    $role = [
        'name' => 'Admin',
        'slug' => 'admin',
    ];

    $response = $this->post('/roles', $role);

    $response->assertStatus(201)
        ->assertRedirect('/roles');

    $this->assertDatabaseHas('roles', [
        'name' => 'Admin',
        'slug' => 'admin'
    ]);
});

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


