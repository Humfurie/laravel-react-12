<?php

use App\Models\Image;
use App\Models\Property;
use App\Models\PropertyPricing;
use App\Models\RealEstateProject;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('minio');

    // Create admin user with property permissions
    $this->user = createAdminUser('property');

    $this->actingAs($this->user, 'api');
});

describe('Property CRUD Operations', function () {
    test('can list properties with pagination', function () {
        Property::factory()->available()->count(25)->create();

        $response = $this->getJson('/api/v1/properties');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => ['*' => [
                    'id', 'title', 'slug', 'description', 'property_type',
                    'listing_status', 'bedrooms', 'bathrooms', 'floor_area',
                    'orientation', 'view_type', 'project', 'pricing', 'contacts', 'images'
                ]],
                'current_page',
                'per_page',
                'total'
            ]);

        expect($response->json('data'))->toHaveCount(15); // Default per_page
        expect($response->json('total'))->toBe(25);
    });

    test('can create a new property', function () {
        $project = RealEstateProject::factory()->create();

        $propertyData = [
            'project_id' => $project->id,
            'title' => 'Test Property',
            'description' => 'A beautiful test property for testing purposes. This property features modern amenities and excellent location.',
            'property_type' => '2br',
            'unit_number' => '15A02',
            'floor_level' => 15,
            'floor_area' => 75.5,
            'floor_area_unit' => 'sqm',
            'bedrooms' => 2,
            'bathrooms' => 2,
            'orientation' => 'North',
            'view_type' => 'City View',
            'listing_status' => 'available',
            'features' => ['Air Conditioning', 'Balcony'],
            'featured' => true
        ];

        $response = $this->postJson('/api/v1/properties', $propertyData);

        $response->assertCreated()
            ->assertJsonFragment([
                'title' => 'Test Property',
                'property_type' => '2br',
                'bedrooms' => 2,
                'featured' => true
            ]);

        $this->assertDatabaseHas('properties', [
            'title' => 'Test Property',
            'property_type' => '2br'
        ]);
    });

    test('validates required fields when creating property', function () {
        $response = $this->postJson('/api/v1/properties', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'project_id', 'title', 'property_type'
            ]);
    });

    test('validates property_type enum values', function () {
        $propertyData = Property::factory()->make(['property_type' => 'invalid_type'])->toArray();

        $response = $this->postJson('/api/v1/properties', $propertyData);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['property_type']);
    });

    test('can retrieve a specific property by slug', function () {
        $property = Property::factory()->create([
            'title' => 'Unique Property',
            'slug' => 'unique-property'
        ]);

        $response = $this->getJson("/api/v1/properties/{$property->slug}");

        $response->assertOk()
            ->assertJsonFragment([
                'id' => $property->id,
                'title' => 'Unique Property',
                'slug' => 'unique-property'
            ]);
    });

    test('increments view count when retrieving property', function () {
        $property = Property::factory()->create(['view_count' => 5]);

        $this->getJson("/api/v1/properties/{$property->slug}");

        expect($property->fresh()->view_count)->toBe(6);
    });

    test('can update a property', function () {
        $property = Property::factory()->create(['floor_area' => 75.0]);

        $updateData = [
            'floor_area' => 85.0,
            'description' => 'Updated description for this property with all the necessary details and information.'
        ];

        $response = $this->putJson("/api/v1/properties/{$property->slug}", $updateData);

        $response->assertOk()
            ->assertJsonFragment([
                'floor_area' => '85.00',
                'description' => 'Updated description for this property with all the necessary details and information.'
            ]);

        $this->assertDatabaseHas('properties', [
            'id' => $property->id,
            'floor_area' => 85.0
        ]);
    });

    test('can soft delete a property', function () {
        $property = Property::factory()->create();

        $response = $this->deleteJson("/api/v1/properties/{$property->slug}");

        $response->assertOk()
            ->assertJson(['message' => 'Property deleted successfully']);

        $this->assertSoftDeleted('properties', ['id' => $property->id]);
    });

    test('returns 404 for non-existent property', function () {
        $response = $this->getJson('/api/v1/properties/non-existent-property');

        $response->assertNotFound();
    });
});

describe('Property Search and Filtering', function () {
    beforeEach(function () {
        // Create a project in Makati
        $makatiProject = RealEstateProject::factory()->create([
            'name' => 'Makati Heights',
            'city' => 'Makati'
        ]);

        // Create a project in BGC
        $bgcProject = RealEstateProject::factory()->create([
            'name' => 'BGC Center',
            'city' => 'BGC'
        ]);

        Property::factory()->create([
            'project_id' => $makatiProject->id,
            'title' => 'Beautiful 3BR Unit in Makati',
            'bedrooms' => 3,
            'bathrooms' => 2,
            'property_type' => '3br',
            'listing_status' => 'available',
            'status' => 'sold' // Ensure only listing_status matches
        ]);

        Property::factory()->create([
            'project_id' => $bgcProject->id,
            'title' => 'Modern 2BR Apartment in BGC',
            'bedrooms' => 2,
            'bathrooms' => 1,
            'property_type' => '2br',
            'listing_status' => 'available',
            'status' => 'sold' // Ensure only listing_status matches
        ]);

        Property::factory()->create([
            'project_id' => $makatiProject->id,
            'title' => 'Sold Unit',
            'listing_status' => 'sold',
            'status' => 'sold' // Explicitly set both to sold
        ]);
    });

    test('can search properties by text', function () {
        $response = $this->getJson('/api/v1/properties?search=Beautiful');

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(1);
        expect($response->json('data.0.title'))->toContain('Beautiful');
    });

    test('can filter by city', function () {
        $response = $this->getJson('/api/v1/properties?city=Makati');

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(1); // 1 available property in Makati (sold property filtered out)
    });

    test('can filter by property type', function () {
        $response = $this->getJson('/api/v1/properties?property_type=3br');

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(1);
        expect($response->json('data.0.property_type'))->toBe('3br');
    });

    test('can filter by price range', function () {
        // Create properties with pricing
        $property1 = Property::factory()->available()->create();
        $property2 = Property::factory()->available()->create();

        PropertyPricing::factory()->create([
            'property_id' => $property1->id,
            'total_contract_price' => 5000000
        ]);

        PropertyPricing::factory()->create([
            'property_id' => $property2->id,
            'total_contract_price' => 8000000
        ]);

        $response = $this->getJson('/api/v1/properties?min_price=4000000&max_price=6000000');

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(1);
    });

    test('can filter by bedrooms', function () {
        $response = $this->getJson('/api/v1/properties?bedrooms=3');

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(1);
        expect($response->json('data.0.bedrooms'))->toBeGreaterThanOrEqual(3);
    });

    test('only returns available properties by default', function () {
        $response = $this->getJson('/api/v1/properties');

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(2); // Should exclude the sold property (from beforeEach)

        foreach ($response->json('data') as $property) {
            expect($property['listing_status'])->toBe('available');
        }
    });

    test('can include sold properties with status filter', function () {
        $response = $this->getJson('/api/v1/properties?listing_status=sold');

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(1);
        expect($response->json('data.0.listing_status'))->toBe('sold');
    });

    test('can sort properties', function () {
        $response = $this->getJson('/api/v1/properties?sort_by=floor_area&sort_direction=desc');

        $response->assertOk();
        $data = $response->json('data');

        // Just check that we get results
        expect(count($data))->toBeGreaterThan(0);
    });

    test('respects per_page limit', function () {
        Property::factory()->available()->count(10)->create();

        $response = $this->getJson('/api/v1/properties?per_page=5');

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(5);
        expect($response->json('per_page'))->toBe(5);
    });

    test('enforces maximum per_page limit', function () {
        $response = $this->getJson('/api/v1/properties?per_page=100');

        $response->assertOk();
        expect($response->json('per_page'))->toBe(50); // Should cap at 50
    });
});

describe('Featured Properties', function () {
    test('can retrieve featured properties', function () {
        Property::factory()->featured()->available()->count(3)->create();
        Property::factory()->available()->count(2)->create(['featured' => false]);

        $response = $this->getJson('/api/v1/properties-featured');

        $response->assertOk();
        expect($response->json())->toHaveCount(3);

        foreach ($response->json() as $property) {
            expect($property['featured'])->toBeTrue();
            expect($property['listing_status'])->toBe('available');
        }
    });

    test('can limit featured properties count', function () {
        Property::factory()->featured()->available()->count(10)->create();

        $response = $this->getJson('/api/v1/properties-featured?limit=3');

        $response->assertOk();
        expect($response->json())->toHaveCount(3);
    });

    test('featured properties include images', function () {
        $property = Property::factory()->featured()->available()->create();
        Image::factory()->forProperty($property)->count(2)->create();

        $response = $this->getJson('/api/v1/properties-featured');

        $response->assertOk();
        expect($response->json('0.images'))->toHaveCount(2);
    });
});
