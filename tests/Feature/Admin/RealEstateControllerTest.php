<?php

use App\Models\Developer;
use App\Models\RealEstateProject;
use Inertia\Testing\AssertableInertia as Assert;

uses()->group('real-estate');

describe('Real Estate Developer Pages', function () {
    it('renders create developer page with correct breadcrumbs', function () {
        $user = createAdminUser('developer');

        $response = $this->actingAs($user)
            ->get(route('real-estate.developers.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn(Assert $page) => $page
            ->component('admin/real-estate/developers/create')
        );
    });

    it('renders edit developer page with correct breadcrumbs', function () {
        $user = createAdminUser('developer');
        $developer = Developer::factory()->create();

        $response = $this->actingAs($user)
            ->get(route('real-estate.developers.edit', $developer));

        $response->assertStatus(200);
        $response->assertInertia(fn(Assert $page) => $page
            ->component('admin/real-estate/developers/edit')
            ->has('developer')
        );
    });

    it('can create a developer', function () {
        $user = createAdminUser('developer');

        $developerData = [
            'company_name' => 'Test Developer Company',
            'description' => 'A test developer company description',
            'contact_email' => 'test@developer.com',
            'contact_phone' => '+639123456789',
            'website' => 'https://testdeveloper.com',
        ];

        $response = $this->actingAs($user)
            ->post(route('real-estate.developers.store'), $developerData);

        $response->assertRedirect();

        $this->assertDatabaseHas('developers', [
            'company_name' => 'Test Developer Company',
            'contact_email' => 'test@developer.com',
        ]);
    });

    it('can update a developer', function () {
        $user = createAdminUser('developer');
        $developer = Developer::factory()->create([
            'company_name' => 'Original Name',
        ]);

        $response = $this->actingAs($user)
            ->put(route('real-estate.developers.update', $developer), [
                'company_name' => 'Updated Developer Name',
                'description' => 'Updated description',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('developers', [
            'id' => $developer->id,
            'company_name' => 'Updated Developer Name',
        ]);
    });
});

describe('Real Estate Project Pages', function () {
    it('renders create project page with correct breadcrumbs', function () {
        $user = createAdminUser('realestate-project');
        Developer::factory()->create(); // Need at least one developer

        $response = $this->actingAs($user)
            ->get(route('real-estate.projects.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn(Assert $page) => $page
            ->component('admin/real-estate/projects/create')
            ->has('developers')
        );
    });

    it('renders edit project page with correct breadcrumbs', function () {
        $user = createAdminUser('realestate-project');
        $developer = Developer::factory()->create();
        $project = RealEstateProject::factory()->create([
            'developer_id' => $developer->id,
        ]);

        $response = $this->actingAs($user)
            ->get(route('real-estate.projects.edit', $project));

        $response->assertStatus(200);
        $response->assertInertia(fn(Assert $page) => $page
            ->component('admin/real-estate/projects/edit')
            ->has('project')
            ->has('developers')
        );
    });

    it('can create a project', function () {
        $user = createAdminUser('realestate-project');
        $developer = Developer::factory()->create();

        $projectData = [
            'developer_id' => $developer->id,
            'name' => 'Test Project Name',
            'description' => 'A test project description',
            'project_type' => 'condominium',
            'city' => 'Makati',
            'province' => 'Metro Manila',
            'region' => 'NCR',
            'status' => 'pre-selling',
        ];

        $response = $this->actingAs($user)
            ->post(route('real-estate.projects.store'), $projectData);

        $response->assertRedirect();

        $this->assertDatabaseHas('real_estate_projects', [
            'name' => 'Test Project Name',
            'developer_id' => $developer->id,
        ]);
    });

    it('can update a project', function () {
        $user = createAdminUser('realestate-project');
        $developer = Developer::factory()->create();
        $project = RealEstateProject::factory()->create([
            'developer_id' => $developer->id,
            'name' => 'Original Project Name',
        ]);

        $response = $this->actingAs($user)
            ->put(route('real-estate.projects.update', $project), [
                'developer_id' => $developer->id,
                'name' => 'Updated Project Name',
                'description' => 'Updated description',
                'project_type' => 'condominium',
                'city' => 'BGC',
                'province' => 'Metro Manila',
                'region' => 'NCR',
                'status' => 'ready_for_occupancy',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('real_estate_projects', [
            'id' => $project->id,
            'name' => 'Updated Project Name',
        ]);
    });
});

describe('Real Estate Authorization', function () {
    it('denies access to create developer without permission', function () {
        $user = createUserWithRole('Viewer', 'viewer', 'developer', ['viewAny', 'view']);

        $response = $this->actingAs($user)
            ->get(route('real-estate.developers.create'));

        $response->assertStatus(403);
    });

    it('denies access to create project without permission', function () {
        $user = createUserWithRole('Viewer', 'viewer', 'realestate-project', ['viewAny', 'view']);
        Developer::factory()->create();

        $response = $this->actingAs($user)
            ->get(route('real-estate.projects.create'));

        $response->assertStatus(403);
    });
});
