<?php

use App\Models\Experience;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('can list experiences for authenticated user', function () {
    Experience::factory()->count(3)->create(['user_id' => $this->user->id]);
    Experience::factory()->count(2)->create(); // Other user's experiences

    $this->actingAs($this->user)
        ->get(route('admin.experiences.index'))
        ->assertOk()
        ->assertInertia(fn($page) => $page
            ->component('Admin/Experience/Index')
            ->has('experiences', 3)
        );
});

test('can show public experiences', function () {
    Experience::factory()->count(5)->create();

    $this->get(route('experiences.public'))
        ->assertOk()
        ->assertJsonCount(5);
});

test('can display create experience form', function () {
    $this->actingAs($this->user)
        ->get(route('admin.experiences.create'))
        ->assertOk()
        ->assertInertia(fn($page) => $page->component('Admin/Experience/Create'));
});

test('can store a new experience', function () {
    Storage::fake('public');
    $image = UploadedFile::fake()->image('company-logo.png');

    $data = [
        'position' => 'Senior Software Engineer',
        'company' => 'Tech Company Inc',
        'location' => 'San Francisco, CA',
        'description' => [
            'Led development of key features',
            'Mentored junior developers',
            'Improved system performance by 40%',
        ],
        'start_month' => 0,
        'start_year' => 2023,
        'end_month' => null,
        'end_year' => null,
        'is_current_position' => true,
        'display_order' => 1,
        'image' => $image,
    ];

    $this->actingAs($this->user)
        ->post(route('admin.experiences.store'), $data)
        ->assertRedirect(route('admin.experiences.index'))
        ->assertSessionHas('success', 'Experience created successfully.');

    $this->assertDatabaseHas('experiences', [
        'position' => 'Senior Software Engineer',
        'company' => 'Tech Company Inc',
        'location' => 'San Francisco, CA',
        'user_id' => $this->user->id,
        'is_current_position' => true,
    ]);

    $experience = Experience::where('position', 'Senior Software Engineer')->first();
    expect($experience->image)->not->toBeNull();
    Storage::disk('public')->assertExists($experience->image->path);
});

test('validates required fields when storing experience', function () {
    $this->actingAs($this->user)
        ->post(route('admin.experiences.store'), [])
        ->assertSessionHasErrors([
            'position',
            'company',
            'location',
            'description',
            'start_month',
            'start_year',
        ]);
});

test('validates description is an array', function () {
    $this->actingAs($this->user)
        ->post(route('admin.experiences.store'), [
            'position' => 'Developer',
            'company' => 'Company',
            'location' => 'Location',
            'description' => 'Not an array',
            'start_month' => 0,
            'start_year' => 2023,
        ])
        ->assertSessionHasErrors(['description']);
});

test('validates month range', function () {
    $this->actingAs($this->user)
        ->post(route('admin.experiences.store'), [
            'position' => 'Developer',
            'company' => 'Company',
            'location' => 'Location',
            'description' => ['Point 1'],
            'start_month' => 13, // Invalid month
            'start_year' => 2023,
        ])
        ->assertSessionHasErrors(['start_month']);
});

test('can display edit experience form', function () {
    $experience = Experience::factory()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)
        ->get(route('admin.experiences.edit', $experience))
        ->assertOk()
        ->assertInertia(fn($page) => $page
            ->component('Admin/Experience/Edit')
            ->has('experience')
        );
});

test('can update an experience', function () {
    $experience = Experience::factory()->create(['user_id' => $this->user->id]);

    $data = [
        'position' => 'Updated Position',
        'company' => 'Updated Company',
        'location' => 'Updated Location',
        'description' => ['Updated description point'],
        'start_month' => 5,
        'start_year' => 2022,
        'end_month' => 10,
        'end_year' => 2023,
        'is_current_position' => false,
        'display_order' => 2,
    ];

    $this->actingAs($this->user)
        ->put(route('admin.experiences.update', $experience), $data)
        ->assertRedirect(route('admin.experiences.index'))
        ->assertSessionHas('success', 'Experience updated successfully.');

    $this->assertDatabaseHas('experiences', [
        'id' => $experience->id,
        'position' => 'Updated Position',
        'company' => 'Updated Company',
        'location' => 'Updated Location',
    ]);
});

test('can update experience with new image', function () {
    Storage::fake('public');
    $experience = Experience::factory()->create(['user_id' => $this->user->id]);

    $oldImage = UploadedFile::fake()->image('old-logo.png');
    $experience->image()->create([
        'name' => 'old-logo.png',
        'path' => $oldImage->store('experiences', 'public'),
    ]);

    $newImage = UploadedFile::fake()->image('new-logo.png');

    $this->actingAs($this->user)
        ->put(
            route('admin.experiences.update', $experience),
            [
                'position' => $experience->position,
                'company' => $experience->company,
                'location' => $experience->location,
                'description' => $experience->description,
                'start_month' => $experience->start_month,
                'start_year' => $experience->start_year,
                'image' => $newImage,
            ]
        )
        ->assertRedirect(route('admin.experiences.index'));

    $experience->refresh();
    expect($experience->image->name)->toBe('new-logo.png');
});

test('prevents unauthorized users from editing others experiences', function () {
    $otherUser = User::factory()->create();
    $experience = Experience::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($this->user)
        ->get(route('admin.experiences.edit', $experience))
        ->assertForbidden();
});

test('can delete an experience', function () {
    $experience = Experience::factory()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)
        ->delete(route('admin.experiences.destroy', $experience))
        ->assertRedirect(route('admin.experiences.index'))
        ->assertSessionHas('success', 'Experience deleted successfully.');

    $this->assertSoftDeleted('experiences', [
        'id' => $experience->id,
    ]);
});

test('prevents unauthorized users from deleting others experiences', function () {
    $otherUser = User::factory()->create();
    $experience = Experience::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($this->user)
        ->delete(route('admin.experiences.destroy', $experience))
        ->assertForbidden();
});

test('orders experiences by display order and date', function () {
    $exp1 = Experience::factory()->create([
        'user_id' => $this->user->id,
        'display_order' => 2,
        'start_year' => 2023,
        'start_month' => 0,
    ]);

    $exp2 = Experience::factory()->create([
        'user_id' => $this->user->id,
        'display_order' => 1,
        'start_year' => 2022,
        'start_month' => 6,
    ]);

    $experiences = Experience::ordered()->get();

    expect($experiences->first()->id)->toBe($exp2->id)
        ->and($experiences->last()->id)->toBe($exp1->id);
});

test('guests cannot access admin experience routes', function () {
    $experience = Experience::factory()->create();

    $this->get(route('admin.experiences.index'))->assertRedirect(route('login'));
    $this->get(route('admin.experiences.create'))->assertRedirect(route('login'));
    $this->post(route('admin.experiences.store'))->assertRedirect(route('login'));
    $this->get(route('admin.experiences.edit', $experience))->assertRedirect(route('login'));
    $this->put(route('admin.experiences.update', $experience))->assertRedirect(route('login'));
    $this->delete(route('admin.experiences.destroy', $experience))->assertRedirect(route('login'));
});

test('guests cannot access debug experiences page', function () {
    $this->get('/debug-experiences')->assertRedirect(route('login'));
});

test('authenticated users without experience permissions cannot access debug experiences page', function () {
    $userWithoutPermissions = createUserWithRole('Viewer', 'viewer', 'blog', ['viewAny']);

    $this->actingAs($userWithoutPermissions)
        ->get('/debug-experiences')
        ->assertForbidden();
});

test('authenticated users with experience permissions can access debug experiences page', function () {
    $userWithPermissions = createAdminUser('experience', ['viewAny']);
    Experience::factory()->count(3)->create();

    $this->actingAs($userWithPermissions)
        ->get('/debug-experiences')
        ->assertOk()
        ->assertInertia(fn($page) => $page
            ->component('debug-experiences')
            ->has('experiences', 3)
        );
});
